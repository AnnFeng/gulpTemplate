
//在你的项目根目录下创建gulpfile.js,代码如下：

// 引入组件
var gulp = require('gulp'),
    path = require('path'),
    browserSync = require('browser-sync').create(),
    minifycss = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    rename = require('gulp-rename'),
    cache = require('gulp-cache'), //图片快取，只有更改过得图片会进行压缩
    notify = require('gulp-notify'), //更动通知
    // sass = require('gulp-ruby-sass'), //编译Sass
    sass = require('gulp-sass'), //编译Sass
    reload = browserSync.reload,
    clean = require('gulp-clean'), //清理档案
    livereload = require('gulp-livereload'), //即时重整
    spritesmith=require('gulp.spritesmith'),
    del = require('del');


var distDir = __dirname + '/sourse';
var outDir = __dirname+"/minified";

gulp.task('sprite-template', function () {
  var spriteData = gulp.src(distDir+'/sprite/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    cssName:'css/sprite1.css',
    useimageset:'true',
    padding:10,  
    algorithm:'binary-tree',
    cssTemplate: function (data) {//函数，直接写到gulpfile.js文件即可。  
        var arr=[];  
        data.sprites.forEach(function (sprite) {  
                arr.push(".icon-"+sprite.name+  
                 "{" +  
                 "background-image: url('"+sprite.escaped_image+"');"+  
                "background-position: "+sprite.px.offset_x+" "+sprite.px.offset_y+";"+  
                "width:"+sprite.px.width+";"+  
                "height:"+sprite.px.height+";"+  
                "}\n");  
        });  
        return arr.join("");  
    } 
}))
  return spriteData.pipe(gulp.dest(outDir +'/images'));
});
//sprite
gulp.task('sprite',function(){  
     gulp.src(distDir+'/sprite/*.png')  
        .pipe(spritesmith({  
            imgName:'sprite.png',  
            cssName:'css/sprite.css',
            useimageset:'true',
            padding:10,  
            algorithm:'binary-tree'  
        }))  
        .pipe(gulp.dest(outDir+'/images'))  
})  

// 静态服务器 + 监听 scss/html 文件
gulp.task('server',  function() {
// gulp.task('server', ['sass'], function() {

    browserSync.init({
        server: __dirname+"/minified"
    });
    gulp.start('sass', 'minifyjs', 'minifycss', 'imagemin','minifyhtml');

    gulp.watch(distDir+"/**/*.scss", ['sass','minifycss']);
    gulp.watch(distDir+"/css/*.css",['minifycss']);
    gulp.watch(distDir+"/js/*.js",['minifyjs']);
    gulp.watch(distDir+"/images/*",['imagemin']);
    gulp.watch(distDir+"/*.html",['minifyhtml']);
    gulp.watch(distDir+"/**/*").on('change', reload);
});
//imagemin
gulp.task('imagemin', function() {
    gulp.src(distDir+'/images/*.{png,jpg,gif,ico}')
        .pipe(cache(imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }], //不要移除svg的viewbox属性
            use: [pngquant()] //使用pngquant深度压缩png图片的imagemin插件
        })))

    .pipe(gulp.dest(outDir+'/images'));
});

gulp.task('sass', function () {
    gulp.watch(distDir+"/sass/*.scss", ['sass']);
    return gulp.src(distDir+'/sass/*.scss')
        .pipe(sass({outputStyle: 'compact'}).on('error', sass.logError))
        .pipe(minifycss({
            // compatibility: 'ie7',//保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
            keepBreaks: true, //类型：Boolean 默认：false [是否保留换行]
            keepSpecialComments: '*'
                //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(outDir+'/css/')); //输出文件
        // .pipe(gulp.dest(distDir+'/css/'))
        // .pipe(reload({stream: true}));
});


//压缩css
gulp.task('minifycss', function() {
    return gulp.src(distDir+'/css/*.css') //需要操作的文件
        // .pipe(rename({suffix: '.min'}))   //rename压缩后的文件名
        .pipe(minifycss({
            // compatibility: 'ie7',//保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
            keepBreaks: true, //类型：Boolean 默认：false [是否保留换行]
            keepSpecialComments: '*'
                //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
        }))
        // .pipe(minifycss())   //执行压缩
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(outDir+'/css')); //输出文件夹
});
gulp.task('minifyhtml', function() {
    return gulp.src(distDir+'/*.html')
        .pipe(gulp.dest(outDir)); //输出
});
//js
gulp.task('minifyjs', function() {
    return gulp.src(distDir+'/js/*.js')
        // .pipe(concat('main.js'))    //合并所有js到main.js
        //.pipe(gulp.dest(outDir+'/js')) //输出main.js到文件夹
        .pipe(rename({suffix: '.min'}))   //rename压缩后的文件名
        .pipe(uglify())    //压缩
        .pipe(gulp.dest(outDir+'/js')); //输出
});
gulp.task('clean', function() {
    return gulp.src([outDir+'/css', outDir+'/js', outDir+'/images'], {
            read: false
        })
        .pipe(clean());
});
//默认命令
gulp.task('default', function() {
    gulp.start('sass', 'minifyjs', 'minifycss', 'imagemin');
});
//默认css,js
gulp.task('cssjs', function() {
    gulp.start('minifyjs', 'minifycss');
});

// 静态服务器
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
});

