$(document).ready(function() {
  $("#new-contact-form, #all-contacts-table, #edit-contact-form, #search-results-table").hide();
  $("#add-contact-button").click(() => $("#main-container").hide() && $("#new-contact-form").show());

  function createTagLinks(tags) {
    return tags
      ? tags.split(",").map((tag) => {
          const link = $("<a></a>")
            .text(tag.trim())
            .attr("href", "");
          link.click(function (event) {
            event.preventDefault();
            const searchTag = tag.trim();
            console.log("searchTag: ", searchTag);
            $("#search-input").val(searchTag); // add tag to search form
            $("#main-container").hide(); // hide the main container
            $.get(
              "http://localhost:3000/api/contacts?tags=" + encodeURI(searchTag),
              function (response) {
                const resultsTableBody = $("#search-results-table tbody");
                resultsTableBody.empty();
                response.forEach(function (contact) {
                  const row = $("<tr></tr>");
                  row.append($("<td></td>").text(contact.name));
                  row.append($("<td></td>").text(contact.phone));
                  row.append($("<td></td>").text(contact.email));
                  row.append($("<td></td>").text(contact.tags));
                  const updateButton = $("<button></button>")
                    .text("Update")
                    .click(function () {
                      showEditForm(contact.id);
                    });
                  row.append(updateButton);
                  resultsTableBody.append(row);
                });
                $("#all-contacts-table").hide();
                $("#search-results-table").show(); // display search results table
              }
            );
          });
          return link[0].outerHTML;
        })
      : "";
  }

  // Function to validate phone number format
  function validatePhoneNumber(phoneNumber) {
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    return phoneRegex.test(phoneNumber);
  }

  // Function to show an error message
  function showError(element, message) {
    const errorElement = $('<div class="error"></div>').text(message);
    element.after(errorElement);
  }

  // Function to remove error messages
  function clearErrors() {
    $('.error').remove();
  }

  // function to fetch contacts from server and update table
  function fetchContacts() {
    $.get("http://localhost:3000/api/contacts", function(response) {
      // remove existing rows from table
      $("#all-contacts-table tbody tr").remove();

      response.forEach(function(contact) {
        const row = $("<tr></tr>");
        $("<td></td>").text(contact.full_name).appendTo(row);
        $("<td></td>").text(contact.phone_number).appendTo(row);
        $("<td></td>").text(contact.email).appendTo(row);

        const tagSpan = $("<span></span>");
        const tagLinks = createTagLinks(contact.tags);
        tagLinks.forEach(function(link, index) {
          if (index > 0) {
            $("<span>, </span>").appendTo(tagSpan);
          }
          tagSpan.append(link);
        });
        $("<td></td>").append(tagSpan).appendTo(row);

        // add edit and delete buttons to the Edit column
        $("<td></td>").html('<button class="edit-contact" data-id="' + contact.id + '">Edit</button> <button class="delete-contact" data-id="' + contact.id + '">Delete</button>').appendTo(row);

        $("#all-contacts-table tbody").append(row);
      });

      $(".delete-contact").click(function() {
        const contactId = $(this).data("id");
        $.ajax({
          method: "DELETE",
          url: "http://localhost:3000/api/contacts/" + contactId,
          context: this, // save reference to clicked element
          success: function(response) {
            alert("Successfully deleted contact!");
            $(this).closest('tr').remove();
          },
          error: function(xhr, status, error) {
            alert("Error deleting contact :(");
            console.log("Error:", error);
          }
        });
      });

      $(".edit-contact").click(function() {
        const contactId = $(this).data("id");
        $("#all-contacts-table").hide();
        
        $.get("http://localhost:3000/api/contacts/" + contactId, function(response) {
          $("#edit-contact-form #full-name").val(response.full_name);
          $("#edit-contact-form #telephone-number").val(response.phone_number);
          $("#edit-contact-form #email-address").val(response.email);
          $("#edit-contact-form #tags").val(response.tags);

          $("<input>").attr({
            type: "hidden",
            name: "id",
            value: contactId
          }).appendTo("#edit-contact-form");
          
          $("#edit-contact-form").show();
        });
      });
    });
  }

  fetchContacts();

  $("#view-contacts-button").click(function() {$("#main-container").hide(); $("#all-contacts-table").show(); fetchContacts();});
  $("#cancel-new-contact").click(function() {$("#new-contact-form").hide(); $("#main-container").show();});
  $("#cancel-edit-contact").click(function() {$("#edit-contact-form").hide(); $("#all-contacts-table").show();});
  $("#home-button").click(function() {$("#all-contacts-table").hide(); $("#main-container").show();});
  $("#search-results-home-button").click(function() {$("#search-results-table").hide(); $("#main-container").show();});
  $("#view-all-contacts-button").click(function() {$("#search-results-table").hide(); $("#all-contacts-table").show(); fetchContacts();});

  $("#search-button").click(function() {
    $("#main-container").hide();
    $.get(
      "http://localhost:3000/api/contacts?tags=" + encodeURI($("#search-form #search").val()),
      function (response) {
        const resultsTableBody = $("#search-results-table tbody");
        resultsTableBody.empty();
        response.forEach(function (contact) {
          const row = $("<tr></tr>");
          row.append($("<td></td>").text(contact.name));
          row.append($("<td></td>").text(contact.phone));
          row.append($("<td></td>").text(contact.email));
          row.append($("<td></td>").text(contact.tags));
          const updateButton = $("<button></button>")
            .text("Update")
            .click(function () {
              showEditForm(contact.id);
            });
          row.append(updateButton);
          resultsTableBody.append(row);
        });
        $("#all-contacts-table").hide();
        $("#search-results-table").show();
      }
    );
  });

  $("#new-contact-form form").submit(function(event) {
    event.preventDefault();

    const fullName = $("#add-full-name").val();
    const emailAddress = $("#add-email-address").val();
    const phoneNumber = $("#add-telephone-number").val();
    const tags = $("#add-tags").val();

    clearErrors();

    // Validate phone number format
    if (!validatePhoneNumber(phoneNumber)) {
      showError($("#add-telephone-number"), "Phone number must be in xxx-xxx-xxxx format.");
      return;
    }

    const formData = {
      full_name: fullName,
      email: emailAddress,
      phone_number: phoneNumber,
      tags: tags
    };

    $.ajax({
      method: "POST",
      url: "http://localhost:3000/api/contacts/",
      data: formData,
      success: function(response) {
        alert("Successfully added new contact!");
        $("#new-contact-form").hide();
        $("#main-container").show();
        $("#new-contact-form form")[0].reset();
      },
      error: function(xhr, status, error) {
        alert("Error adding new contact :(");
        console.log("Error:", error);
      }
    });
  });

  $("#edit-contact-form form").submit(function(event) {
    event.preventDefault(); 
    const contactId = $("#edit-contact-form input[type=hidden]").val();

    const fullName = $("#edit-contact-form #full-name").val();
    const emailAddress = $("#edit-contact-form #email-address").val();
    const phoneNumber = $("#edit-contact-form #telephone-number").val();
    const tags = $("#edit-contact-form #tags").val();

    clearErrors();

    // Validate phone number format
    if (!validatePhoneNumber(phoneNumber)) {
      showError($("#edit-contact-form #telephone-number"), "Phone number must be in xxx-xxx-xxxx format.");
      return;
    }

    const formData = {
      full_name: fullName,
      email: emailAddress,
      phone_number: phoneNumber,
      tags: tags
    };

    $.ajax({
      method: "PUT",
      url: "http://localhost:3000/api/contacts/" + contactId,
      data: formData,
      success: function(response) {
        alert("Successfully updated contact!");
        $("#edit-contact-form input[name='id']").remove();
        $("#edit-contact-form").hide();
        $("#all-contacts-table").show();
        fetchContacts();
      },
      error: function(xhr, status, error) {
        alert("Error updating contact :(");
        console.log("Error:", error);
      }
    });
  });

  $("#search-form").submit(function(event) {
    event.preventDefault();
    const searchTerm = $("#search-input").val().trim().toLowerCase();

    $.get("/api/contacts", function(response) {
        const filteredContacts = response.filter(contact => ["full_name", "email", "phone_number", "tags"].some(field => contact[field].toLowerCase().includes(searchTerm)));

        $("#all-contacts-table").hide();
        $("#search-results-table").show();

        const searchTableBody = $("#search-results-table tbody");
        searchTableBody.empty();

        filteredContacts.forEach(contact => {
            const row = $("<tr></tr>");
            $("<td></td>").text(contact.full_name).appendTo(row);
            $("<td></td>").text(contact.phone_number).appendTo(row);
            $("<td></td>").text(contact.email).appendTo(row);

            const tagSpan = $("<span></span>");
            createTagLinks(contact.tags).forEach((link, index) => {
                if (index > 0) $("<span>, </span>").appendTo(tagSpan);
                tagSpan.append(link);
            });
            $("<td></td>").append(tagSpan).appendTo(row);

            $("<td></td>").html(`<button class="edit-contact" data-id="${contact.id}">Edit</button> <button class="delete-contact" data-id="${contact.id}">Delete</button>`).appendTo(row);

            searchTableBody.append(row);
        });
    }).fail(jqXHR => console.log(`Error fetching contacts: ${jqXHR.statusText}`));
  });

  $(".tag-link").on("click", function(event) {
    // Prevent the default behavior of following the link
    event.preventDefault();

    // Retrieve the tag name from the clicked link
    const tag = $(this).text().trim();

    // Update the search input field with the tag
    $("#search-input").val(tag);

    // Trigger a search with the selected tag
    $("#search-button").click();
  });
});