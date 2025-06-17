// Get that hamburger menu cookin' //

document.addEventListener("DOMContentLoaded", function() {
  // Get all "navbar-burger" elements
  var $navbarBurgers = Array.prototype.slice.call(
    document.querySelectorAll(".navbar-burger"),
    0
  );
  // Check if there are any navbar burgers
  if ($navbarBurgers.length > 0) {
    // Add a click event on each of them
    $navbarBurgers.forEach(function($el) {
      $el.addEventListener("click", function() {
        // Get the target from the "data-target" attribute
        var target = $el.dataset.target;
        var $target = document.getElementById(target);
        // Toggle the class on both the "navbar-burger" and the "navbar-menu"
        $el.classList.toggle("is-active");
        $target.classList.toggle("is-active");
      });
    });
  }
});

// Smooth Anchor Scrolling
$(document).on("click", 'a[href^="#"]', function(event) {
  event.preventDefault();
  $("html, body").animate(
    {
      scrollTop: $($.attr(this, "href")).offset().top
    },
    500
  );
});

// When the user scrolls down 20px from the top of the document, show the scroll up button
window.onscroll = function() {
  scrollFunction();
};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    document.getElementById("toTop").style.display = "block";
  } else {
    document.getElementById("toTop").style.display = "none";
  }
}

// Preloader
$(document).ready(function($) {
  $(".preloader-wrapper").fadeOut();
  $("body").removeClass("preloader-site");
});
$(window).load(function() {
  var Body = $("body");
  Body.addClass("preloader-site");
});

// Autoscroll
var scrollInterval;
var isScrolling = false;

function startScrolling() {
  if (isScrolling) return;
  isScrolling = true;
  scrollInterval = setInterval(function() {
    window.scrollBy(0, 1);
  }, 20);
}

function stopScrolling() {
  if (!isScrolling) return;
  isScrolling = false;
  clearInterval(scrollInterval);
}

// Start scrolling when the page loads
$(document).ready(function() {
  setTimeout(startScrolling, 3000); // Start after 3 seconds to allow user to see the top
});

// Stop scrolling on user interaction
$(window).on('scroll wheel DOMMouseScroll mousewheel keyup touchmove', function(e) {
  if ( e.type === 'scroll' ) {
    // Let the native scroll happen
  } else {
    stopScrolling();
  }
});

// Floating bubbles/stars effect
document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("bubbles-container");

  if (container) {
    for (let i = 0; i < 30; i++) {
      const bubble = document.createElement("div");
      bubble.classList.add("bubble");
      bubble.style.left = Math.random() * 100 + "vw";
      bubble.style.width = bubble.style.height = Math.random() * 8 + 5 + "px";
      bubble.style.animationDuration = (Math.random() * 5 + 6) + "s";
      bubble.style.animationDelay = (Math.random() * 5) + "s";
      container.appendChild(bubble);
    }
  }
});
