var NP_HUB_CDN =
  "https://cdn.jsdelivr.net/npm/@namphuongtechnologi/np-hub@0.1.1/dist/np-hub.min.global.js";

function initNpHub() {
  var widget = document.createElement("np-hub");
  widget.setAttribute("project-id", "NPP");
  widget.setAttribute("is-dev", "");

  // Cấu hình dự án (Project Config)
  widget.priority = 0;
  widget.coordinators = [];
  widget.emailContacts = [];

  document.body.appendChild(widget);

  widget.setUser({
    name: "Nguyen Van A",
    email: "a@gmail.com",
    phoneNumber: "0912345678",
  });

  widget.setFormPrefill({
    content: "Mô tả sự cố cần hỗ trợ...",
    attachments: [],
  });

  widget.addEventListener("np-hub-submit-success", function (event) {
    console.log("Tạo yêu cầu thành công:", event.detail);
  });

  widget.addEventListener("np-hub-submit-error", function (event) {
    console.error("Lỗi gửi yêu cầu:", event.detail);
  });
}

var script = document.createElement("script");
script.src = NP_HUB_CDN;
script.onload = initNpHub;
document.head.appendChild(script);
