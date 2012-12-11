var fs = require("fs");
var exec = require('child_process').exec
var underscore = require("underscore");
var configs = [
    {file:/.*\.txt/g, command:"node -v"}  ,
    {file:/.*\.js/g, command:"node -v"}
];
var source = "E:\\Project\\node";

String.format = function () {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }

    return s;
};

(function (fs, exec, underscore) {
    var readFiles = function (dir, done) {
        var results = [];
        fs.readdir(dir, function (err, list) {
            if (err) return done(err);
            var pending = list.length;
            if (!pending) return done(null, results);
            list.forEach(function (file) {
                file = dir + '/' + file;
                fs.stat(file, function (err, stat) {
                    if (stat && stat.isDirectory()) {
                        readFiles(file, function (err, res) {
                            results = results.concat(res);
                            if (!--pending) done(null, results);
                        });
                    } else {
                        results.push(file);
                        if (!--pending) done(null, results);
                    }
                });
            });
        });
    };
    var start = function (source, configs) {
        var watch = function (error, list) {
            configs.forEach(function (cmd) {
                var files = underscore.filter(list, function (n) {
                    return n.match(cmd.file);
                });
                files.forEach(function (file) {
                    fs.watch(file, function (oper, f) {
                        var changeCommand = String.format(cmd.command, f);
                        console.log(String.format("{0} changed,command '{1}' execute...", f, changeCommand));
                        exec(changeCommand, function (err, stdout, stderr) {
                            console.log(err ? stderr : stdout);
                        });
                    });
                });

            });
        };
        readFiles(source, watch);
    };
    return {start:start};
})(fs, exec, underscore).start(source, configs);

