document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  

  // Listening for various clicks
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  
 
  // By default, load the inbox
  load_mailbox('inbox');

});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

// Sent and Inbox Views
if (mailbox === 'sent' || 'inbox') {
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);


      emails.forEach( (email, index) => {
      const element = document.createElement('div');
      element.setAttribute("class", "emailline");
      element.setAttribute("id", `email${index}`)
      element.setAttribute("data-id", `${emails[index].id}`)
      if (mailbox === 'sent') {
      element.innerHTML = `<strong>To ${emails[index].recipients}:</strong> ${emails[index].subject} <span class="time"> ${emails[index].timestamp}`;
    } else {
      element.innerHTML = `<strong>From ${emails[index].sender}:</strong> ${emails[index].subject} <span class="time"> ${emails[index].timestamp}`;
    }
      document.querySelector('#emails-view').append(element);
      document.querySelector(`#email${index}`).addEventListener('click', () => load_email(emails[index].id));

    });
    });
    


  }
}


function send_email() {
  
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result)
  });
  load_mailbox('sent');
  return false;
}

function load_email(email_id) {
  // Hide the Inboxes
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

fetch(`/emails/${email_id}`)
.then(response => response.json())
.then(email => {
    // Print email
    console.log(email);

    // ... do something else with email ...
});
}