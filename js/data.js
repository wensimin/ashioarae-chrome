let host = "https://shali.tech:3000/ashioarae/"
// 展示的消息类型和对应颜色
let messageType = {
    error: "red",
    good: "green",
    info: "black"
}
// 日志可用级别
let logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
}
// 当前日志级别
let logLevel = logLevels.debug;


class Type {
    /**
     * type: string, 类型枚举,和后端1:1
     */
    type;
    /**
     * domain: string, 域名,关系到cookie范围
     */
    domain;
    /**
     * cookiePage: string  获取cookie的页面,为空时会以https协议跳转domain
     */
    cookiePage;
    /**
     *刷新cookie的方法,用于定时刷新
     */
    refreshCookie;
    /**
     * cacheClear: boolean 是否清除头像缓存
     * @type {boolean}
     */
    cacheClear = true
    /**
     * headEdit: boolean 头像是否可以编辑 目前全部为true
     * @type {boolean}
     */
    headEdit = true;
    /**
     * nickEdit: boolean, 昵称是否可编辑,后端未实现的属性,昵称目前全部不可编辑
     * @type {boolean}
     */
    nickEdit = false;
    /**
     * 默认刷新cookie的方法
     */
    defaultRefreshCookie = async () => {
        await $.ajax(this.cookiePage, {
            type: "get", global: false
        });
    }

    constructor(type, domain, cookiePage = null, cacheClear = true, refreshCookie = this.defaultRefreshCookie, headEdit = true, nickEdit = false) {
        this.type = type;
        this.domain = domain;
        this.cookiePage = cookiePage ? cookiePage : "https://" + domain;
        this.cacheClear = cacheClear;
        this.refreshCookie = refreshCookie;
        this.headEdit = headEdit;
        this.nickEdit = nickEdit;
    }



}

let weiboType = new Type("weibo", "weibo.com", null, null,
    async () => {
        let regex = /(?<=location\.replace\(").+?(?="\);)/gm;
        //第一次请求后获得html
        let html = await $.ajax(weiboType.cookiePage, {
            type: "get", global: false
        });
        //解析html
        let res = regex.exec(html);
        if (!res) {
            return;
        }
        //获取第二次请求的url
        let url = res[0];
        //第二次请求
        let endHtml = await $.ajax(url, {
            type: "get", global: false
        });
        log("weibo 302 html: " + endHtml, logLevels.info, true)
    });

let typeList = [
    new Type("bilibili", "bilibili.com"),
    new Type("steam", "steamcommunity.com"),
    new Type("twitter", "twitter.com", null, false),
    new Type("github", "github.com"),
    new Type("google", "google.com"),
    new Type("instagram", "instagram.com"),
    weiboType,
    new Type("baidu", "baidu.com", "https://tieba.baidu.com"),
]