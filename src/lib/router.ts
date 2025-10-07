import { Store } from './store';

export type Route = {
  path: string;
  params: Record<string, string>;
};

type RouteHandler = (params: Record<string, string>) => () => void | void;

export class Router {
  private currentRoute = new Store<Route>({ path: '/', params: {} });
  private routes: Map<string, RouteHandler> = new Map();
  private cleanup: (() => void) | null = null;

  constructor() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => this.handleRouteChange());
    window.addEventListener('load', () => this.handleRouteChange());
  }

  /**
   * Register a route handler
   * @param pattern Route pattern like "/", "/calendar", "/day/:ymd"
   * @param handler Function to call when route matches
   */
  on(pattern: string, handler: RouteHandler): void {
    this.routes.set(pattern, handler);
  }

  /**
   * Navigate to a new route
   */
  navigate(path: string): void {
    window.location.hash = path;
  }

  /**
   * Get current route store
   */
  getRoute(): Store<Route> {
    return this.currentRoute;
  }

  private handleRouteChange(): void {
    const hash = window.location.hash.slice(1) || '/';
    const { path, params } = this.matchRoute(hash);

    this.currentRoute.set({ path, params });

    // Run previous cleanup (if any)
    if (this.cleanup) {
      try {
        this.cleanup();
      } catch (error) {
        console.error('[Router] Cleanup error', error);
      }
      this.cleanup = null;
    }

    // Find and execute matching handler
    for (const [pattern, handler] of this.routes) {
      if (this.isMatch(pattern, path)) {
        const routeParams = this.extractParams(pattern, path);
        const maybeCleanup = handler(routeParams);
        if (typeof maybeCleanup === 'function') {
          this.cleanup = maybeCleanup;
        }
        return;
      }
    }

    // No match found - call 404 handler if registered
    const notFoundHandler = this.routes.get('*');
    if (notFoundHandler) {
      const maybeCleanup = notFoundHandler({});
      if (typeof maybeCleanup === 'function') {
        this.cleanup = maybeCleanup;
      }
    }
  }

  private matchRoute(hash: string): { path: string; params: Record<string, string> } {
    return { path: hash, params: {} };
  }

  private isMatch(pattern: string, path: string): boolean {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);

    if (pattern === '*') return true; // Wildcard catch-all
    if (patternParts.length !== pathParts.length) return false;

    return patternParts.every((part, i) => {
      return part.startsWith(':') || part === pathParts[i];
    });
  }

  private extractParams(pattern: string, path: string): Record<string, string> {
    const params: Record<string, string> = {};
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);

    patternParts.forEach((part, i) => {
      if (part.startsWith(':')) {
        const paramName = part.slice(1);
        params[paramName] = pathParts[i];
      }
    });

    return params;
  }
}

// Create singleton router instance
export const router = new Router();
