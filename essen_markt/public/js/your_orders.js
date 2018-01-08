userId = getQueryVariable("user");
$(document).ready (() => {
    getOrderHistory();

    $('a.nav-link.link').attr("href", (n,v) => {
        console.log("URL is :" + v+"?user="+userId);
        return v+"?user="+userId;
    });
});

function getOrderHistory()  {


    console.log('userId in getOrder is '+userId);
    $.ajax({

        url: 'http://localhost:5000/search',
        data: {
            searchVal: userId,
            filter:'userId'
        },
        dataType: 'json',
        type: 'POST',
        success: function(data) {
            console.log("success");
            const searchObj  = data;
            const objCount   = data.length;
            let tempArray = [];
            console.log(data);

            $('.product-container').css("display","block");

            if( objCount > 0)  {
                let context = data;
                let source = document.getElementById('display-template').innerHTML;
                let template = Handlebars.compile(source);
                let html = template({context});
                $('.product-container').html(html);
            }
            else {
                $('#product-container').text("No results found");
            }
        },
        error: function() {
            $("#error").removeClass("hidden");
            $("#error").append("error occurred in displaying user data");
        },
    });
}
