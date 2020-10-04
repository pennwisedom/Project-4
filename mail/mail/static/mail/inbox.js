document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').addEventListener('submit', send_email);

 
  // By default, load the inbox
  load_mailbox('inbox');

});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = ''; 


  
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

// Sent and Inbox Views
if (mailbox === 'sent' || 'inbox' || 'archived') {
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
      if (emails[index].read === true) {
        element.style.backgroundColor = "lightgray";
      }
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
  // Hide the Inboxes and clear any previous email
  document.querySelector('#email-view').innerHTML = '';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

// Mark Email as read
fetch(`/emails/${email_id}`, {
  method: 'PUT',
  body: JSON.stringify({
      read: true
  })
})
  

// Display Email
fetch(`/emails/${email_id}`)
.then(response => response.json())
.then(email => {
    // Print email
    console.log(email);
    
      // Sender
      const element = document.createElement('div');
      element.setAttribute("class", "header");
      element.setAttribute("id", "from");
      element.innerHTML = `<strong>From:</strong> ${email.sender}`;
      document.querySelector('#email-view').append(element);
      
      // Recipient
      const element1 = document.createElement('div');
      element1.setAttribute("class", "header");
      element1.setAttribute("id", "to");
      element1.innerHTML = `<strong>To:</strong> ${email.recipients}`;
      document.querySelector('#email-view').appendChild(element1);

      // Subject
      const element2 = document.createElement('div');
      element2.setAttribute("class", "header");
      element2.setAttribute("id", "subject");
      element2.innerHTML = `<strong>Subject:</strong> ${email.subject}`;
      document.querySelector('#email-view').appendChild(element2);

      // Timestamp
      const element3 = document.createElement('div');
      element3.setAttribute("class", "header");
      element3.setAttribute("id", "time");
      element3.innerHTML = `<strong>Timestamp:</strong> ${email.timestamp}`;
      document.querySelector('#email-view').appendChild(element3);

      // Reply Button
      const repbutton = document.createElement('button');
      repbutton.setAttribute("class", "btn btn-sm btn-outline-primary");
      repbutton.setAttribute("id", "reply");
      repbutton.innerHTML = "Reply";
      document.querySelector('#email-view').appendChild(repbutton);
      
      // Archive Button
      const elbutton = document.createElement('button');
      elbutton.setAttribute("class", "btn btn-sm btn-outline-primary");
      elbutton.setAttribute("id", "archive");
      if (email.archived === true) {
        elbutton.innerHTML = "Unarchive"
      } else {
        elbutton.innerHTML = "Archive";
      }
      document.querySelector('#email-view').appendChild(elbutton);


      // Body
      const elementbody = document.createElement('div');
      elementbody.setAttribute("class", "body");
      elementbody.setAttribute("id", "body");
      elementbody.innerHTML = `${email.body}`;
      document.querySelector('#email-view').appendChild(elementbody);

      // Set email to Archived or Unarchive an email
      if (email.archived === true) {
        document.querySelector("#archive").addEventListener('click', () => unarchiver(email_id));

      } else {

      document.querySelector("#archive").addEventListener('click', () => archiver(email_id));
      }

      // Reply View
      document.querySelector("#reply").addEventListener('click', () => {
        document.querySelector('#compose-view').style.display = 'block';
        document.querySelector('#email-view').style.display = 'none';

        document.querySelector("#title").innerHTML = "Reply";
        
        // Prepopulate Replay fields
        document.querySelector("#compose-recipients").value = `${email.sender}`;
        if (email.subject.substring(0,3) !== "Re:") {
          document.querySelector("#compose-subject").value = `Re: ${email.subject}`;
        } else {
        document.querySelector("#compose-subject").value = `${email.subject}`;
      }

      document.querySelector("#compose-body").value = `\n----------------\n On ${email.timestamp} ${email.sender} wrote:\n ${email.body}`;

 })


      })  

}

function archiver(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
  document.querySelector("#archive").innerHTML = "Archived!";
  return false;
}

function unarchiver(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })
  document.querySelector("#archive").innerHTML = "Unarchived!";
  return false;
}