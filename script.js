const UNLISTED_STYLE_KEYS = ["outline", "position", "top", "left", "bottom", "right", "width", "height"];

var focussedObject = null;

function generateKey(length = 16, digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_") {
    var key = "";

    for (var i = 0; i < length; i++) {
        key += digits.charAt(Math.floor(Math.random() * digits.length));
    }

    return key;
}

function switchToPaneView(viewName) {
    $(".paneView").hide();
    $(".paneView[data-view='" + viewName + "']").show();
}

function getObjectStyles(element) {
    var styleObject = {};
    var styleString = element.attr("style");
    var inValue = false;
    var inString = false;
    var currentKey = "";
    var currentValue = "";

    for (var i = 0; i < styleString.length; i++) {
        if (styleString[i] == "\"") {
            inString = !inString;

            if (!inValue) {
                currentKey += "\"";
            } else {
                currentValue += "\"";
            }
        } else if (styleString[i] == ":" && !inString) {
            inValue = true;
        } else if (styleString[i] == ";" && !inString) {
            if (!UNLISTED_STYLE_KEYS.includes(currentKey.trim())) {
                styleObject[currentKey.trim()] = currentValue.trim();
            }

            currentKey = "";
            currentValue = "";

            inValue = false;
        } else {
            if (!inValue) {
                currentKey += styleString[i];
            } else {
                currentValue += styleString[i];
            }
        }
    }

    return styleObject;
}

function updateObjectStyles(element) {
    var styleObject = {};

    $(".objectStyles > .objectStyle").each(function() {
        styleObject[$(this).find("input.key").val().trim()] = $(this).find("input.value").val().trim();

        if ($(this).find("input.value").val().trim() == "") {
            $(this).closest(".objectStyle").remove();
        }
    });

    element.css(styleObject);

    $("footer").text("Updated object styles.");
}

function applyObjectStyles(element) {
    var styleObject = getObjectStyles(element);

    $(".objectStyles").html("");

    for (var key in styleObject) {
        $(".objectStyles").append(
            $("<div class='objectStyle'>").append(
                $("<input class='code key'>")
                    .val(key)
                    .focus(function() {
                        $("footer").text("Enter a CSS key for this style property.");
                    })
                    .change(function() {
                        updateObjectStyles(element);
                    })
                ,
                $("<input class='code value'>")
                    .val(styleObject[key])
                    .focus(function() {
                        $("footer").text("Enter a CSS value for this style property or leave it blank to delete the property.");
                    })
                    .change(function() {
                        updateObjectStyles(element);
                    })
            )
        );
    }
}

function newObjectStyleProperty() {
    $(".objectStyles").append(
        $("<div class='objectStyle'>").append(
            $("<input class='code key'>")
                .val("key")
                .focus(function() {
                    $("footer").text("Enter a CSS key for this style property. Press Tab to edit to the CSS value.");
                })
                .change(function() {
                    updateObjectStyles(focussedObject);
                })
            ,
            $("<input class='code value'>")
                .val("value")
                .focus(function() {
                    $("footer").text("Enter a CSS value for this style property. Press Enter to update the object.");
                })
                .change(function() {
                    updateObjectStyles(focussedObject);
                })
        )
    );

    $(".objectStyles .objectStyle:last-child input.key").focus().select();
}

function deleteObject() {
    focussedObject.remove();

    focussedObject = null;

    switchToPaneView("main");

    $("footer").text("Deleted object.");
}

function duplicateObject() {
    var originalElement = focussedObject;

    newObject();

    focussedObject.css(getObjectStyles(originalElement));

    focussedObject.css({
        "top": "calc(" + originalElement.css("top") + " + 20px)",
        "left": "calc(" + originalElement.css("left") + " + 20px)",
        "width": originalElement.css("width"),
        "height": originalElement.css("height")
    });

    focusObject(focussedObject);

    $("footer").text("Duplicated object. New object is now selected.");
}

function focusObject(element) {
    focussedObject = element;

    $(".object").css({
        "outline": "none"
    });

    element.css({
        "outline": "2px solid #3c78d8"
    });

    $("[data-object-attr='name']").val(element.attr("name"));
    $("[data-object-property='text']").val(element.text());

    applyObjectStyles(element);

    switchToPaneView("editObject");

    $("footer").text("Selected object: " + element.attr("name"));
}

function newObject() {
    var newElement = $("<div class='object'>").append($("<span>"));

    newElement.attr("name", "(" + generateKey() + ")");

    newElement.css({
        "position": "absolute",
        "top": String($(".workspace").scrollTop() + ($(".workspace").innerHeight() / 2) - 50) + "px",
        "left": String($(".workspace").scrollLeft() + ($(".workspace").innerWidth() / 2) - 50) + "px",
        "width": "100px",
        "height": "100px",
        "padding": "10px",
        "background-color": "white",
        "color": "black",
        "border": "5px solid black",
        "z-index": "0"
    });

    newElement.draggable();

    newElement.resizable({
        handles: "n, s, e, w, ne, se, nw, sw",
        stop: function() {
            setTimeout(function() {
                focusObject(newElement);                
            });
        }
    });

    newElement.click(function() {
        focusObject(newElement);
    });

    $(".workspace").append(newElement);

    focusObject(newElement);
}

$(function() {
    $(".workspace").click(function(event) {
        if (event.target != this) {
            return;
        }

        focussedObject = null;

        $(".object").css("outline", "none");

        switchToPaneView("main");

        $("footer").text("Deselected object. Select an object to change its properties.");
    });

    $("[data-object-attr]").change(function() {
        focussedObject.attr($(this).attr("data-object-attr"), $(this).val());
    });

    $("[data-object-property='text']").change(function() {
        focussedObject.find("span").text($(this).val());
    });
});