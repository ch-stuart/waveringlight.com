const searchParams = new URLSearchParams(window.location.search);
if (searchParams.has("success")) {
const elem = document.getElementById("thanks");
if (elem) {
    elem.textContent = "Thank you! We will respond as soon as possible!";
    elem.style.display = "block";
}
}
