/*
 * fedao 配置文件
 * author younthxg@gmail.com
 */
'use strict';

const isProd = (fis.env()._media !== 'dev');
fis.set('namespace', 'vote');

// 模块化支持
fis.hook('commonjs', {
    // baseUrl: './widget',// 配置模块查找根目录
    extList: ['.js', '.jsx', '.es', '.ts', '.tsx', '.es6'],
    // require('vue') => require('/node_modules/vue/dist/vue.common.js')
    packages: [{
        name: 'vue',
        location: 'node_modules/vue/dist',
        main: 'vue.common.js'
    }]
});
// 待移出
// px2rem
fis.enableRem = function(options) {
    // 路径问题需要自己配
    fis.match('/client/**less', {
        // 追加px2rem
        postprocessor: fis.plugin('px2rem', {
            remUnit: 75
        }, 'append')
    });
};
// es6 解析
fis.parseJS = function(conf) {
    if (conf.type === 'ts') {
        return fis.plugin('typescript', {
            module: 1, // commonjs
            target: 1, // {0: es3, 1: es5, 2: es6}  
            sourceMap: conf.sourceMap
        })
    }
    return fis.plugin('babel-5.x', {
        blacklist: ['regenerator'],
        optional: ["es7.decorators", "es7.classProperties"],
        sourceMaps: conf.sourceMap,
        stage: conf.stage || 3, // 2为了支持解构赋值 否则可以为3
    }, 'append')
}
fis.enbleRequire = function(conf) {
    return [
        fis.plugin('js-require-file', {
            useEmbedWhenSizeLessThan: 8
        }),
        fis.plugin('js-require-css', {
            mode: 'dependency'
        })
    ]
}
fis.enbleNpm = function() {
    // fis3 中预设的是 fis-components，这里不需要，所以先关了。
    fis.unhook('components');
    // 使用 fis3-hook-node_modules 插件。
    fis.hook('node_modules');
}

fis.enbleNpm(); // 支持npm
var matchRules = {
    '*': {
        release: '/${namespace}/$0'
    },
    // 配置模拟数据，mock数据在最外层
    '/(mock/**)': {
        release: '$1',
        useCompile: false,
    },
    // 需要支持npm包
    'node_modules/**.js': {
        isMod: true,
    },
    'widget/**.{js,jsx,less,css,es6,es}': {
        isMod: true
    },
    'static/scripts/{common,pomelo}/**': {
        isMod: true
    },
    // widget开启同名依赖，fis3默认是关闭的 并允许你在 js 中直接 require css+文件
    '{widget, static/scripts/common}/**.{js,es}': {
        useSameNameRequire: true,
        preprocessor: fis.enbleRequire(),
        parser: fis.parseJS({
            sourceMap: !isProd,
            stage: 2
        }),
        rExt: '.js'
    },
    '*.html': {
        useMap: true
    },
    '*.less': {
        parser: fis.plugin('less', null, 'append'),
        postprocessor: fis.plugin('autoprefixer', {
            browsers: ['android 4', 'ios 6', 'last 1 Chrome versions', 'last 2 Safari versions'],
            "cascade": true
        }),
        rExt: '.css',
        isCssLike: true
    },
    'widget/**.less': {
        postprocessor: fis.plugin('px2rem', {
            remUnit: 75
        }, 'append')
    },
};

fis.util.map(matchRules, function(selector, rules) {
    fis.match(selector, rules);
});

// 因为是纯前端项目，依赖不能自断被加载进来，所以这里需要借助一个 loader 来完成，
// 注意：与后端结合的项目不需要此插件!!!
fis.match('::package', {
    packager: fis.plugin('deps-pack', {
        useTrack: !isProd, // 是否输出路径信息,默认为 true
        useSourceMap: !isProd, // 合并后开启 SourceMap 功能。
        // 将 /node_module 中的依赖项，打包成 static/pkg/webappreact/third.js
        'static/pkg/third.js': [
            // 将 /app/index.js 的依赖项加入队列，包含了 /app 中的依赖项 和 /node_modules 中的依赖项
            'widget/testing/main.js:deps',
            // 移除 /app/** 只保留 /node_module 中的依赖项
            '!/widget/**'
        ],

        // 'static/pkg/lib.js': 'static/scripts/libs/**',
        'static/pkg/common.js': 'static/scripts/common/**',

        // 业务打包

        'static/pkg/list.css': 'widget/list/**.{less,css}',
        'static/pkg/list.js': [
            'widget/list/main.js',
            // 将 的所有依赖项加入队列，因为第一步中已经命中了 /node_module 中的所有依赖项，因此这里只打包 /app 中的依赖项
            'widget/list/main.js:deps'
        ],

    }),
    // 分析 __RESOURCE_MAP__ 结构，来解决资源加载问题
    postpackager: fis.plugin('loader', {
        resourceType: 'commonJs',
        // allInOne: true,
        useInlineMap: true // 资源映射表内嵌
    })
});

// 测试环境 && 线上打包
['prod', 'qa'].forEach(function(v) {
    fis.media(v)
        .match('mock/**', {
            release: false,
            useCompile: false,
        })
        .match('widget/**.js', {
            parser: fis.plugin('jdists', {
                remove: "debug," + (v === 'prod' ? 'test' : 'prod')
            }, 'prepend')
        })
        .match('*.{js,css,less,es6,jsx,es}', {
            useHash: true
        })
        .match('::image', {
            useHash: true
        })
        .match('*.{js,es6,jsx,es}', {
            optimizer: fis.plugin('uglify-js')
        })
        .match('*.{css,less}', {
            optimizer: fis.plugin('clean-css')
        })
        .match('page/**.html:css', {
            optimizer: fis.plugin('clean-css')
        })
        .match('*.png', {
            optimizer: fis.plugin('png-compressor')
        })
        .match('page/**.html', {
            optimizer: fis.plugin('html-compress')
        })
        // 优化moduleId
        .match('/**.{js,es6}', {
            moduleId: function(m, path) {
                return fis.util.md5(path);
            }
        })
        .match('*.{js,css,jsx,es6,es,less,png,jpg,gif,jpeg,swf}', {
            domain: v === 'prod' ? ['//res.haibian.com'] : ['//ceshi.zxstatic.haibian.com']
        })
        // 站立直播文件单独发布
        .match('page/(mainteacherpad).html', {
            rExt: '.blade.php',
            isHtmlLike: true,
            release: '/$1',
        });
})

// 测试环境release
fis.media('qa')
    .match('*', {
        // domain: null,
        // optimizer: null,
        // useHash: false,
        useSprite: false,
        deploy: fis.plugin('http-push', {
            receiver: 'http://ceshi.zxstatic.haibian.com/receiver.php',
            to: '/home/work/speiyou_static' // to = $to + $file.release
        })
    })
    // 站立直播文件单独发布
    .match('page/(mainteacherpad).html', {
        deploy: fis.plugin('http-push', {
            receiver: 'http://ceshi.zxstatic.haibian.com/receiver.php',
            to: '/home/work/haibian_classroom/resources/views/classroom' // to = $to + $file.release
        })
    });

fis.media('dev').match('widget/**.js', {
    parser: fis.plugin('jdists', {
        remove: 'test,prod'
    }, 'prepend')
});
