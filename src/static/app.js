document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;


        // Create participants list HTML with delete icon
        let participantsHTML = "<div class='participants-list'>";
        if (details.participants.length > 0) {
          details.participants.forEach(email => {
            participantsHTML += `
              <div class="participant-item" data-activity="${encodeURIComponent(name)}" data-email="${encodeURIComponent(email)}">
                <span class="participant-email">${email}</span>
                <span class="delete-participant" title="Unregister">&#128465;</span>
              </div>
            `;
          });
        } else {
          participantsHTML += `<div class='no-participants'>No participants yet</div>`;
        }
        participantsHTML += "</div>";

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <strong>Participants:</strong>
            ${participantsHTML}
          </div>
        `;
  // Event delegation for delete icon
  activitiesList.addEventListener("click", async (event) => {
    if (event.target.classList.contains("delete-participant")) {
      const participantDiv = event.target.closest(".participant-item");
      const activity = decodeURIComponent(participantDiv.getAttribute("data-activity"));
      const email = decodeURIComponent(participantDiv.getAttribute("data-email"));
      if (!confirm(`Unregister ${email} from ${activity}?`)) return;
      try {
        const response = await fetch(`/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`, {
          method: "POST"
        });
        const result = await response.json();
        if (response.ok) {
          participantDiv.remove();
          messageDiv.textContent = result.message;
          messageDiv.className = "success";
        } else {
          messageDiv.textContent = result.detail || "An error occurred";
          messageDiv.className = "error";
        }
        messageDiv.classList.remove("hidden");
        setTimeout(() => {
          messageDiv.classList.add("hidden");
        }, 5000);
      } catch (error) {
        messageDiv.textContent = "Failed to unregister. Please try again.";
        messageDiv.className = "error";
        messageDiv.classList.remove("hidden");
        console.error("Error unregistering:", error);
      }
    }
  });

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      // Add pretty styles for participants section and delete icon
      const style = document.createElement('style');
      style.textContent = `
      .participants-section {
        margin-top: 10px;
        background: #e3f2fd;
        border-radius: 4px;
        padding: 10px 12px 8px 12px;
        border: 1px solid #90caf9;
      }
      .participants-section strong {
        color: #1565c0;
        font-size: 15px;
      }
      .participants-list {
        margin: 8px 0 0 0;
        padding: 0;
      }
      .participant-item {
        display: flex;
        align-items: center;
        margin-bottom: 4px;
        background: #ffffff;
        border-radius: 3px;
        padding: 4px 8px 4px 8px;
        border: 1px solid #1976d2;
        font-size: 15px;
        transition: background 0.2s;
      }
      .participant-item:hover {
        background: #e3f2fd;
      }
      .participant-email {
        flex: 1;
        color: #0d47a1;
        font-weight: 500;
      }
      .delete-participant {
        margin-left: 10px;
        color: #d84315;
        cursor: pointer;
        font-size: 20px;
        transition: color 0.2s;
        user-select: none;
        background: #fff3e0;
        border-radius: 50%;
        padding: 2px 6px;
        border: 1px solid #ffab91;
      }
      .delete-participant:hover {
        color: #fff;
        background: #d84315;
        border-color: #d84315;
      }
      .participants-list .no-participants {
        color: #888;
        font-style: italic;
        padding-left: 2px;
      }
      `;
      document.head.appendChild(style);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
