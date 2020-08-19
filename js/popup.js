$(function () {
    $("#test").click(function () {
        getCookieString("bilibili.com").then((s) => {
            console.log(s);
        })
    });
})

/**
 * 获取指定域名的cookie
 * @param domain 域名
 * @returns {Promise<string>} cookieString
 */
async function getCookieString(domain) {
    let cookieString = "";
    await new Promise((resolve) => {
        chrome.cookies.getAll({domain: domain}, function (cookies) {
            cookies.forEach(function (c) {
                cookieString += c.name + "=" + c.value + "; "
            });
            resolve();
        });
    })
    return cookieString;
}