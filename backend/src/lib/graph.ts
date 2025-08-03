export class Graph {
  adjacencyList: Record<number, Set<number>>;
  constructor() {
    this.adjacencyList = {};
  }
  static loadFromJsonString(json: string) {
    const graph = new Graph();
    const data = JSON.parse(json);
    for (const [key, value] of Object.entries(data)) {
      graph.adjacencyList[Number(key)] = new Set<number>(value as number[]);
    }
    return graph;
  }
  addVertex(vertex: number) {
    if (!this.adjacencyList[vertex]) {
      this.adjacencyList[vertex] = new Set<number>();
    }
  }
  addEdge(vertex1: number, vertex2: number) {
    this.adjacencyList[vertex1].add(vertex2);
    this.adjacencyList[vertex2].add(vertex1);
  }
  jsonify() {
    return JSON.stringify(
      Object.fromEntries(
        Object.entries(this.adjacencyList).map(([key, value]) => [
          key,
          Array.from(value),
        ])
      )
    );
  }
  bfs(start: number) {
    const queue = [start];
    const visited = new Set<number>();
    while (queue.length) {
      const vertex = queue.shift()!;
      visited.add(vertex);
      for (const neighbor of this.adjacencyList[vertex]) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }
    return visited;
  }
  findConnectedComponents() {
    const components: Set<number>[] = [];
    const visited = new Set<number>();
    for (const vertex in this.adjacencyList) {
      if (!visited.has(Number(vertex))) {
        const component = this.bfs(Number(vertex));
        components.push(component);
        component.forEach((v) => visited.add(v));
      }
    }
    return components.map((component) => Array.from(component));
  }
}
