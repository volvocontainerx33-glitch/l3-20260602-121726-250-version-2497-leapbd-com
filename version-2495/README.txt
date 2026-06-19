纯静态电影网站生成说明

- 实际解析影片数量：2000
- 独立详情页数量：2000
- 独立分类页数量：10
- 首页：index.html
- 分类总览：categories.html
- 热播榜：ranking.html
- 全站索引：sitemap.html / sitemap.xml
- 播放器：详情页使用上传 JS 中解析到的 150 个 m3u8 播放源循环绑定，并通过 assets/hls-dru42stk.js 加载。
- 封面路径：页面按顶级目录 1.jpg 到 150.jpg 引用封面；当前上传 ZIP 中未包含这些图片文件，可后续放入站点根目录。

注意：本说明文件不是网页内容，不会显示在 HTML 页面中。
