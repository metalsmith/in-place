import { Plugin } from 'metalsmith';
export default initializeInPlace;
export type Render = (source: string, options: any, locals: any) => string;
export type RenderAsync = (source: string, options: any, locals: any, callback: Function) => Promise<string>;
export type Compile = (source: string, options: any) => string;
export type CompileAsync = (source: string, options: any, callback: Function) => Promise<string>;
export type JsTransformer = {
  name: string;
  inputFormats: string[];
  outputFormat: string;
  render?: Render;
  renderAsync?: RenderAsync;
  compile?: Compile;
  compileAsync?: CompileAsync;
  [key]?: string;
};
export type Options = {
  /**
   * Jstransformer to run: name of a node module or local JS module path (starting with `.`) whose default export is a jstransformer. As a shorthand for existing transformers you can remove the `jstransformer-` prefix: `marked` will be understood as `jstransformer-marked`. Or an actual jstransformer; an object with `name`, `inputFormats`,`outputFormat`, and at least one of the render methods `render`, `renderAsync`, `compile` or `compileAsync` described in the [jstransformer API docs](https://github.com/jstransformers/jstransformer#api)
   */
  transform: string | JsTransformer;
  /**
   * One or more paths or glob patterns to limit the scope of the transform.
   * @default '**\/*.<transform.inputFormats>'
   */
  pattern?: string|string[];
  /**
   * Pass options to the jstransformer templating engine that's rendering your files.
   * @default {}
   */
  engineOptions?: any;
  /**
   * Pass `''` to remove the extension or `'.<extname>'` to keep or rename it.
   * @default transform.outputFormat
   */
  extname?: string;
};
/**
 * A metalsmith plugin for in-place templating
 * @example
 * import nunjucks from 'jstransformer-nunjucks'
 * 
 * metalsmith
 *  .use(inPlace({ transform: 'jstransformer-nunjucks' })) // use jstransformer-nunjucks
 *  .use(inPlace({ transform: 'nunjucks' }))               // shorthand for above
 *  .use(inPlace({ transform: nunjucks }))                 // equivalent to above
 *  .use(inPlace({ transform: './local/transform.js' }))   // custom local transformer
 *  .use(inPlace({ transform: {                            // custom inline transformer
 *     name: 'prepend-hello',
 *     inputFormats: ['prepend-hello'],
 *     outputFormat: 'html',
 *     render(str, options, locals) => {
 *       return 'hello ' + str
 *     }
 *   }}))
 */
declare function initializeInPlace(options?: Options): Plugin;
