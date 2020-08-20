$(function () {
    chrome.storage.sync.get(null, (config) => {
        $("#username").val(config["username"]);
        $("#password").val(config["password"]);
    });
    $("#auth").click(function () {
        let username = $("#username").val();
        let password = $("#password").val();
        let config = {"username": username, "password": password};
        chrome.storage.sync.set(config);
        $.get(host + "user", {}, function (result) {
            if (result === username) {
                alert("认证成功");
            }
        });
    });
});