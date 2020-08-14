window.onload = function () {
    $("#test").click(function () {
        chrome.cookies.getAll({}, function (cookies) {
            console.log(cookies);
        });
    });
}