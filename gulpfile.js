var gulp = require('gulp');
var compass = require('gulp-compass'); //sass编译压缩
var jshint = require('gulp-jshint'); //js检查
var transport = require("gulp-seajs-transport"); //对seajs的模块进行预处理：添加模块标识
var concat = require("gulp-seajs-concat"); //seajs模块合并
var uglify = require('gulp-uglify'); //js压缩
var gulpSequence = require('gulp-sequence'); //任务同步执行
var browserSync = require('browser-sync').create(); //资源(css,js,phtml)同步至浏览器

// 路径配置
var pathConfig = {
    html_path: '../www/',
	proxy: 'http://www.local.houyuantuan.com/',
    style_sass_path: 'style/sass/',
    style_dist_path: 'style/dist/',
    image_path: 'image/',
    script_src_path: 'script/src/',
    script_dist_path: 'script/dist/'
};

// sass编译压缩
gulp.task('compass', function() {
    //gulp-compass 可以自动在图片后面加上图片修改的时间戳，如果找不到图片，进程中会提示not found
    return gulp.src(pathConfig.style_sass_path + '**/*.scss') // 返回一个 stream 来表示它已经被完成,整个任务执行时间
        .pipe(compass({
            project: __dirname, //文件存储位置,Load config without config.rb,set your project path.
            css: pathConfig.style_dist_path, //css文件输出路径
            sass: pathConfig.style_sass_path, //scss源文件路径
            image: pathConfig.image_path, //图片路径
            relative: false, //禁止使用相对路径
            time: true, //开启关闭编译时间
            style: 'compressed' //nested, expanded, compact, or compressed
        }))
        .pipe(gulp.dest(pathConfig.style_dist_path))
        .pipe(browserSync.stream());
});

// js语法检查
gulp.task('jshint', function() {
    return gulp.src([pathConfig.script_src_path + '!(lib)/**/*.js', '!' + pathConfig.script_src_path + '/**/*.min.js'])
        .pipe(jshint({
            'sub': true, //允许person[name], JSHint推荐使用person.name代替person[name]
            'multistr': true, //允许多行字符串
            '-W004': true, //variable is already defined
            '-W018': true, //confusing use for '!'
            '-W030': true, //expected an assignment or function call  and instead saw an expression
            '-W041': true, //use '===' to compare
            '-W049': true, //unexpected escape character '<' in regular expression
            '-W061': true, //'eval' is harmful
            '-W082': true, //Function declarations should not be placed in blocks
            '-W085': true, //don't use 'with'
            '-W093': true, //did you mean to return a condition instead of an assignment
            '-W128': true //empty array element require elision=true
        }))
        .pipe(jshint.reporter('default', {
            verbose: true //显示错误码，如[W041]
        }));
});

// js合并压缩优化处理
gulp.task('script', ['jshint'], function() {
    return gulp.src(pathConfig.script_src_path + '!(lib)/**/*.js')
        .pipe(transport()) //添加模块标识
        .pipe(concat({
            base: pathConfig.script_dist_path
        })) //模块合并
        .pipe(uglify()) //优化
        .pipe(gulp.dest(pathConfig.script_dist_path));
});

// 资源(css,js,phtml)同步至浏览器
gulp.task('serve', /* ['compass', 'script'],启动即执行*/ function() {
    // 代理
    browserSync.init({
        proxy: pathConfig.proxy //域名或IP
    });
    gulp.watch(pathConfig.style_sass_path + '**/*.scss', ['compass']); //注入css
    gulp.watch(pathConfig.html_path + '**/*.phtml').on('change', browserSync.reload); //刷新
    gulp.watch(pathConfig.script_src_path + '!(lib)/**/*.js').on('change', browserSync.reload); //本地调试无需注入js，直接刷新
});

// 监听事件
gulp.task('watch', function() {
    gulp.watch(pathConfig.style_sass_path + '**/*.scss', ['compass']);
});

gulp.task('default', gulpSequence(['compass', 'script']));