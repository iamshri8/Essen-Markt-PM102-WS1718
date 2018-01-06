let userId= getQueryVariable("user");
// var searchBox = new google.maps.places.SearchBox(document.getElementById('mapsearch'));

$(document).ready(() => {
    $('.filter-values').on('click','a', function(event){
        event.preventDefault();
        const id = $(this).attr('id');
        retrieveItems(id);
    });

    $('.filter-values-days').on('click','a', function(event){
        event.preventDefault();
        const id = $(this).attr('id');
        retrieveItemsOnTime(id);
    });

    $('a.nav-link.link').attr("href", (n,v) =>{
        return v+"?user="+userId;
    });
});

function retrieveItems(id)  {
    let searchValue;
    let filterType = (id == null) ? 'city' : 'category' ;

    if(id == null)  {
        let searchStr = $("#mapsearch").val().split(', ');
        searchValue = searchStr[0].toLowerCase();
    }
    else {
        $("#mapsearch").val('');
        searchValue = id.toLowerCase();
    }

    $.ajax({

        url: 'http://localhost:5000/search',
        data: {
            searchVal: searchValue,
            filter:filterType
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

function retrieveItemsOnTime(id)  {


    $.ajax({

        url: 'http://localhost:5000/search',
        data: {
            searchVal: id,
            filter:'listTime'
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


function retrieveIndividual(id)  {

    var queryString = "?user=" + id;
    window.location.href = "individual_search.html" + queryString;

}