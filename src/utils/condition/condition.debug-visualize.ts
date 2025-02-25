interface DebugNode {
  id: string;
  label: string;
  color: string;
  shape: 'box' | 'ellipse';
}

interface DebugViz {
  kind: { graph: true };
  nodes: DebugNode[];
  edges: { from: string; to: string; label: string }[];
}

/**
 * The `DebugVisualizer` class provides static methods for visualizing and debugging
 * the structure of nodes and edges in a graph-like format.
 *
 * @ref https://marketplace.visualstudio.com/items?itemName=hediet.debug-visualizer
 *
 * @remarks
 * This class is designed to be used for debugging purposes, allowing developers to
 * visualize the relationships between different nodes.
 *
 * @example
 * ```typescript
 * DebugVisualizer.reset();
 * const nodeId = DebugVisualizer.getNodeId();
 * DebugVisualizer.addNode({ id: nodeId, label: 'Start Node' });
 * const viz = DebugVisualizer.getViz();
 * console.log(viz);
 * ```
 */
export class DebugVisualizer {
  private static nodeCounter = 0;
  private static viz: DebugViz = {
    kind: { graph: true },
    nodes: [],
    edges: [],
  };

  static reset() {
    this.nodeCounter = 0;
    this.viz = {
      kind: { graph: true },
      nodes: [],
      edges: [],
    };
  }

  static getNodeId(): string {
    return `node_${this.nodeCounter++}`;
  }

  static addNode(node: DebugNode, parentId?: string) {
    this.viz.nodes.push(node);
    if (parentId) {
      this.viz.edges.push({
        from: parentId,
        to: node.id,
        label: '',
      });
    }
  }

  static getViz(): DebugViz {
    return this.viz;
  }
}
