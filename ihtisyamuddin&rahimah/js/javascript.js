document.addEventListener("DOMContentLoaded", function () {
    AOS.init({
        easing: "ease-out",
        duration: 800,
    });

    function playMusic() {
        const backgroundMusic = document.getElementById("background_music");
        backgroundMusic.play();
        document.getElementById("myModal").style.display = "none";
    }

    document.getElementById("content").style.display = "block";

    var now = new Date();
    var day = now.getDate();
    var month = now.getMonth() + 1;
    var year = now.getFullYear() + 1;
    var nextyear = month + '/' + day + '/' + year + ' 07:07:07';
    var hari = '09/23/2023 12:00:00';

    $('#hitungmundur').countdown({
        date: hari,
        offset: +8,
        day: 'Hari',
        days: 'Hari',
        hour: 'Jam',
        hours: 'Jam',
        minute: 'Minit',
        minutes: 'Minit',
        second: 'Saat',
        seconds: 'Saat'
    }, function () {
        alert('Done!');
    });
});
