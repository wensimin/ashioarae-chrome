$(function () {
    init();
})
let typeList = [{
    type: "bilibili",
    domain: "bilibili.com",
    needCookie: ["SESSDATA", "bili_jct", "DedeUserID"],
    headEdit: true,
    nickEdit: false
}];

function init() {
    // 获取预更新数据
    $.get(host + "ashi", null).then(res => {
        let item = $("#ashiData")
        let nickInput = item.find(".nickValue")
        nickInput.val(res.nickname);
        let image = item.find(".headImage")
        image.prop("src", host + "file/public/" + res.headImage);
        image.click(() => {
            item.find(".imageFile").click();
        })
    });
    //初始化所有其他目的类型
    typeList.forEach(function (t) {
        getCookieString(t.domain, t.needCookie).then(cookie => {
            //上传cookie
            debugger;
            console.log(cookie);
            $.post(host + "ashi", JSON.stringify({
                type: t.type,
                //FIXME 使用ashi数据而不使用type数据
                nickname: "shali",
                headImage: "shali/ashioarae.jpg",
                cookie: cookie
            })).then(() => {
                    // 请求当前数据
                    $.get(host + "ashi/" + t.type, null, function (res) {
                        let item = $("#ashiItem").clone();
                        item.find(".type").val(t.type);
                        let nickInput = item.find(".nickValue")
                        nickInput.val(res.nickname);
                        nickInput.prop("disabled", !t.nickEdit);
                        item.find(".headImage").prop("src", res.headImage);
                        $("#container").append(item);
                        item.show();
                    })
                }
            );
        });

    });
}

/**
 * 获取指定域名的cookie
 * @param domain 域名
 * @param needCookie 需要的cookie列表
 * @returns {Promise<string>} cookieString
 */
async function getCookieString(domain, needCookie) {
    let cookieString = "";
    await new Promise((resolve) => {
        chrome.cookies.getAll({domain: domain}, function (cookies) {
            cookies.forEach(function (c) {
                debugger
                if (needCookie.includes(c.name)) {
                    if (cookieString) {
                        cookieString += "; ";
                    }
                    cookieString += c.name + "=" + c.value;
                }
            });
            resolve();
        });
    })
    return cookieString;
}