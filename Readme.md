# metalsmith-templates

A fork of [metalsmith-templates](https://github.com/segmentio/metalsmith-templates). The original `metalsmith-templates` uses the `inPlace` flag to switch between either in-place templating or embedding a file within a template, this fork just supports in-place templating. It can be used in conjunction with [ismay/metalsmith-layouts](https://github.com/ismay/metalsmith-layouts), which just embeds source files in templates.

This originated in [https://github.com/segmentio/metalsmith-templates/issues/35](https://github.com/segmentio/metalsmith-templates/issues/35). Splitting up `metalsmith-templates` was suggested by Ian Storm Taylor as a way to simplify both use-cases. It allows you to apply templates (or layouts) to your files *and/or* render the templating syntax in your source files.

## Changes

* The `default`, `directory` and `inPlace` options have been removed

For further documentation see the original [metalsmith-templates](https://github.com/segmentio/metalsmith-templates), but keep these differences in mind.

## License

MIT
