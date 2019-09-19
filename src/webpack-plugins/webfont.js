let glob = require('glob');
let path = require('path');
let mix = require('laravel-mix');

function getFilesAndDeps (patterns, context) {
    var files = [];
    var filesDeps = [];
    var directoryDeps = [];

    function addFile (file) {
        filesDeps.push(file);
        files.push(path.resolve(context, file));
    }

    function addByGlob (globExp) {
        var globOptions = {cwd: context};

        var foundFiles = glob.sync(globExp, globOptions);
        files = files.concat(foundFiles.map(file => {
            return path.resolve(context, file);
        }));

        var globDirs = glob.sync(path.dirname(globExp) + '/', globOptions);
        directoryDeps = directoryDeps.concat(globDirs.map(file => {
            return path.resolve(context, file);
        }));
    }

    // Re-work the files array.
    patterns.forEach(function (pattern) {
        if (glob.hasMagic(pattern)) {
            addByGlob(pattern);
        } else {
            addFile(pattern);
        }
    });

    return {
        files: files,
        dependencies: {
            directories: directoryDeps,
            files: filesDeps
        }
    };
}

class WebFont {

    name() {
        return 'webfont';
    }

    dependencies() {
        return ['webfonts-loader'];
    }

    /**
     * Register the component.
     *
     * When your component is called, all user parameters
     * will be passed to this method.
     *
     * Ex: register(src, output) {}
     * Ex: mix.yourPlugin('src/path', 'output/path');
     *
     * @param  {*} ...params
     * @return {void}
     *
     */
    register(options) {
        let WebFontGenerator = require('webfonts-generator');

        let files = [];

        options.files.map(filePath => {
                if (File.find(filePath).isDirectory()) {
                    filePath += path.sep + '**/*';
                }

                if (!filePath.includes('*')) {
                    files.push(filePath);
                }

                files = files.concat(glob.sync(filePath));
        });

        options.files = files;

        WebFontGenerator(options, (err, res) => {
            if (err) {
                console.log(err);
            }
        });
    }
}

mix.extend('webfont', new WebFont());