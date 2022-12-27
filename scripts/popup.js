let link = document.getElementById("git-link");
link.addEventListener("click", (e) => {
    window.open(link.href, "_blank").focus();
})