$(function () {
    //初始化数据
    initData().then();
    //初始化事件
    initAction();
})

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
        this.cookiePage = cookiePage;
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

function initAction() {
    $("#imageFile").change(() => {
        let formData = new FormData();
        formData.append('file', $("#imageFile")[0].files[0]);
        $.ajax({
            url: host + "file",
            type: "POST",
            cache: false,
            data: formData,
            processData: false,
            contentType: false
        }).done(res => {
            let preHead = $("#preHeadImage");
            preHead.prop("src", host + "file/public/" + res + "?time=" + new Date().getTime());
            preHead.attr("upPath", res);
        });
    });
    $("#update").click(() => {
        $.post(host + "ashi/pre", JSON.stringify({
            nickname: $("#preNick").val(),
            headImage: $("#preHeadImage").attr("upPath")
        })).done(() => {
            message("预更新信息已保存,开始同步各平台", messageType.good);
            update().then();
        });
    });
}

/**
 * 错误消息
 * @param t 当前的目标target平台
 * @param res http res
 * @param actionText 消息按钮文本
 * @param action 附带的事件
 */
function errorMessage(t, res, actionText, action) {
    if (res.status === 500) {
        if (res.responseJSON.type === "cookie") {
            message(t.type + ": cookie失效", messageType.error, "跳转获取cookie", () => {
                let url = t.cookiePage ? t.cookiePage : "https://" + t.domain;
                window.open(url);
            });
        } else if (res.responseJSON.type === "timeout") {
            message(t.type + ": 获取信息超时", messageType.error, actionText, action);
        } else if (res.responseJSON.type === "error") {
            message(t.type + "出现错误: " + res.responseJSON.message, messageType.error);
        }
    } else {
        message(t.type + "未知错误", messageType.error);
    }
}


/**
 * 进行同步
 */
async function update() {
    for (const t of typeList) {
        let config = await getConfig()
        let tarConfig = config.tarConfig;
        if (!tarConfig[t.type]) {
            continue;
        }
        if (t.nickEdit) {
            $.ajax(host + "ashi/nick/" + t.type, {type: "put"}).then(() => {
                message(t.type + ":昵称更新完毕", messageType.good);
            });
        }
        if (t.headEdit) {
            updateHead(t);
        }
    }
}

/**
 * 更新头像
 * @param t  目标平台
 */
function updateHead(t) {
    $.ajax(host + "ashi/head/" + t.type, {type: "put", global: false}).then(() => {
        message(t.type + ":头像更新完毕", messageType.good);
    }).fail(res => {
        errorMessage(t, res, "重试", () => updateHead(t));
    });
}


/**
 * 初始化数据
 */
async function initData() {
    // 获取预更新数据
    $.get(host + "ashi", null).then(res => {
        let item = $("#ashiData")
        let nickInput = item.find(".nickValue")
        nickInput.val(res.nickname);
        let image = item.find(".headImage")
        image.prop("src", host + "file/public/" + res.headImage);
        image.attr("upPath", res.headImage);
        image.click(() => {
            item.find("#imageFile").click();
        })
    });
    //初始化所有其他目的类型
    for (const t of typeList) {
        let config = await getConfig()
        let tarConfig = config.tarConfig;
        if (!tarConfig[t.type]) {
            continue;
        }
        let cookie = await getCookieString(t.domain);
        //上传cookie
        $.post(host + "ashi", JSON.stringify({
            type: t.type,
            cookies: cookie
        })).then(() => getAshiTarget(t));
    }
}

/**
 * 获取对应平台的信息
 * @param t target
 */
function getAshiTarget(t) {
    // 请求当前数据
    $.ajax(host + "ashi/" + t.type, {type: "get", global: false}).then(res => {
        let item = $(".ashiItem").first().clone();
        item.find(".type").html(t.type);
        let nickLabel = item.find(".nickValue")
        nickLabel.html(res.nickname);
        let url = new URL(res.headImage);
        if (t.cacheClear) {
            url.searchParams.set('_t_', new Date().getTime().toString());
        }
        item.find(".headImage").prop("src", url.toString());
        item.find(".updateButton").click(() => updateHead(t));
        let container = $("#container");
        container.append(item);
        item.show();
    }).fail(res => {
        errorMessage(t, res, "重试", () => getAshiTarget(t));
    });
}

/**
 * 获取指定域名的cookie
 * @param domain 域名
 * @returns {Promise<string>} cookieString
 */
async function getCookieString(domain) {
    return await new Promise((resolve) => {
        chrome.cookies.getAll({domain: domain}, function (cookies) {
            if (cookies.length === 0) {
                message(domain + "的cookie未获取", messageType.info);
                return;
            }
            resolve(cookies);
        });
    });
}


