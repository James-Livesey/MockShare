function newItem() {
    var newElement = $("<div>");

    newElement.css({
        "position": "absolute",
        "width": "100px",
        "height": "100px",
        "background-color": "white",
        "color": "black",
        "border": "5px solid black"
    });

    newElement.draggable();

    newElement.resizable({
        handles: "n, s, e, w, ne, se, nw, sw"
    });

    $(".workspace").append(newElement);
}