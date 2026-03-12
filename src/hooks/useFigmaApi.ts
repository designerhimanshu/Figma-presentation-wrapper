import { useState, useEffect } from 'react';

export interface Artboard {
  id: string;
  name: string;
}

function getRawFigmaUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.pathname === '/embed') {
      const innerUrl = u.searchParams.get('url');
      if (innerUrl) return decodeURIComponent(innerUrl);
    }
  } catch (e) {}
  return url;
}

export function extractFigmaFileKey(url: string): string | null {
  const rawUrl = getRawFigmaUrl(url);
  // Matches /file/xyz123, /proto/xyz123, /design/xyz123
  const match = rawUrl.match(/\/(?:file|proto|design)\/([a-zA-Z0-9]{22,})/);
  return match ? match[1] : null;
}

export function extractNodeId(url: string): string | null {
  try {
    const rawUrl = getRawFigmaUrl(url);
    const u = new URL(rawUrl);
    const nodeId = u.searchParams.get('starting-point-node-id') || u.searchParams.get('node-id');
    if (nodeId) {
      return nodeId.replace(/-/g, ':');
    }
  } catch(e) {}
  return null;
}

export function useFigmaApi(figmaUrl: string, figmaToken: string) {
  const [artboards, setArtboards] = useState<Artboard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!figmaUrl || !figmaToken) {
      setArtboards([]);
      return;
    }

    const fileKey = extractFigmaFileKey(figmaUrl);
    if (!fileKey) {
      setError("Invalid Figma URL format. Could not extract file key.");
      return;
    }

    const targetNodeId = extractNodeId(figmaUrl);

    const fetchFigmaFrames = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
          headers: {
            'X-Figma-Token': figmaToken,
          },
        });

        if (!response.ok) {
          throw new Error(`Figma API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const document = data.document;
        
        let startNodeId = targetNodeId;
        // If no explicit node ID in URL, check if there are defined flow starting points
        if (!startNodeId && document.flowStartingPoints && document.flowStartingPoints.length > 0) {
            startNodeId = document.flowStartingPoints[0].nodeId;
        }

        if (!document || !document.children) {
          setArtboards([]);
          return;
        }

        // 1. Traverse all pages and collect all top-level artboards (Frames, Components, Component Sets)
        const allCandidateFrames: any[] = [];
        
        // 2. Map every single descendant to its parent top-level frame.
        // This is crucial because a prototype interaction often sets its 'destinationId' 
        // to a specific child layer or interactive component state, NOT the top-level Frame ID.
        const nodeIdToFrameId = new Map<string, string>();
        
        const mapDescendants = (n: any, frameId: string) => {
          nodeIdToFrameId.set(n.id, frameId);
          if (n.children) {
            n.children.forEach((child: any) => mapDescendants(child, frameId));
          }
        };

        const isContainerNode = (type: string) => ['FRAME', 'COMPONENT', 'COMPONENT_SET'].includes(type);

        document.children.forEach((page: any) => {
          if (page.type === 'CANVAS') {
            (page.children || []).forEach((node: any) => {
              if (isContainerNode(node.type)) {
                 allCandidateFrames.push(node);
                 mapDescendants(node, node.id);
              } else if (node.type === 'SECTION' && node.children) {
                 for (const child of node.children) {
                   if (isContainerNode(child.type)) {
                     allCandidateFrames.push(child);
                     mapDescendants(child, child.id);
                   }
                 }
              }
            });
          }
        });

        // 3. Resolve the user's starting point to its top-level Frame ID
        const actualStartFrameId = startNodeId ? (nodeIdToFrameId.get(startNodeId) || startNodeId) : null;

        // 4. Trace all explicit outbound prototype clicks/interactions
        const getOutboundDestinations = (node: any): string[] => {
          const dests: string[] = [];
          const traverse = (n: any) => {
            if (n.transitionNodeID) {
              const mapped = nodeIdToFrameId.get(n.transitionNodeID) || n.transitionNodeID;
              dests.push(mapped);
            }
            if (n.reactions) {
              for (const r of n.reactions) {
                const actions = r.actions || (r.action ? [r.action] : []);
                for (const a of actions) {
                  if (a.destinationId) {
                    const mapped = nodeIdToFrameId.get(a.destinationId) || a.destinationId;
                    dests.push(mapped);
                  }
                }
              }
            }
            if (n.children) {
              n.children.forEach(traverse);
            }
          };
          traverse(node);
          return dests;
        };

        const adjacency = new Map<string, string[]>();
        allCandidateFrames.forEach(frame => {
          adjacency.set(frame.id, getOutboundDestinations(frame));
        });

        // 5. Breadth-First Search to map all connected screens 
        const reachableIds = new Set<string>();
        const orderedReachableIds: string[] = [];

        if (actualStartFrameId) {
          reachableIds.add(actualStartFrameId);
          orderedReachableIds.push(actualStartFrameId);
          const queue = [actualStartFrameId];
          while(queue.length > 0) {
            const curr = queue.shift()!;
            const outbound = adjacency.get(curr) || [];
            for (const outId of outbound) {
              if (!reachableIds.has(outId)) {
                reachableIds.add(outId);
                orderedReachableIds.push(outId);
                queue.push(outId);
              }
            }
          }
        }

        // 6. Filter & Order candidate frames.
        const extractedArtboards: Artboard[] = [];
        
        // If we found a proper sequence, use the chronological prototype order
        if (actualStartFrameId && reachableIds.size > 1) {
           for (const id of orderedReachableIds) {
              const frame = allCandidateFrames.find(f => f.id === id);
              if (frame) {
                 extractedArtboards.push({ id: frame.id, name: frame.name });
              }
           }
        } else {
           // Fallback to spatial raw order if no connections
           for (const frame of allCandidateFrames) {
              extractedArtboards.push({ id: frame.id, name: frame.name });
           }
        }

        setArtboards(extractedArtboards);
      } catch (err: any) {
        console.error("Figma API fetch failed:", err);
        setError(err.message || "Failed to fetch artboards from Figma API.");
        setArtboards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFigmaFrames();
  }, [figmaUrl, figmaToken]);

  return { artboards, loading, error };
}
