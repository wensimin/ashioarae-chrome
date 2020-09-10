let host = "https://shali.tech:3000/ashioarae/"

let messageType = {
    error: "red",
    good: "green",
    info: "black"
}

class Type {
    /**
     * domain: string, 域名,关系到cookie范围
     * nickEdit: boolean, 昵称是否可编辑,后端未实现的属性,昵称目前全部不可编辑
     * type: string, 类型枚举,和后端1:1
     * headEdit: boolean 头像是否可以编辑 目前全部为true
     * cookiePage: string  获取cookie的页面,为空时会以https协议跳转domain
     * cacheClear: boolean 是否清除头像缓存
     * */
    type;
    domain;
    cookiePage;
    headEdit = true;
    nickEdit = false;
    cacheClear = true

    constructor(type, domain, cookiePage = null, cacheClear = true, headEdit = true, nickEdit = false) {
        this.type = type;
        this.domain = domain;
        this.cookiePage = cookiePage ? cookiePage : "https://" + domain;
        this.headEdit = headEdit;
        this.nickEdit = nickEdit;
        this.cacheClear = cacheClear;
    }

}


let typeList = [
    new Type("bilibili", "bilibili.com"),
    new Type("steam", "steamcommunity.com"),
    new Type("twitter", "twitter.com", null, false),
    new Type("github", "github.com"),
    new Type("google", "google.com"),
    new Type("instagram", "instagram.com"),
    new Type("weibo", "weibo.com"),
    new Type("baidu", "baidu.com", "https://tieba.baidu.com"),
]