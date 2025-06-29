# AFT - Group Expense Tracker (Mobile App)

A cross-platform mobile application built with React Native for tracking group expenses, payments, and balances. It features offline support, real-time data syncing, and a clean, dark-mode interface optimized for mobile use.

*(You can replace the image link above with a path to your own screenshot if you prefer)*

## ✨ Key Features

  * **💸 Expense & Payment Tracking:** Easily log expenses, split them equally or by exact amounts, and record direct payments to settle debts.
  * **📊 Dynamic Balances:** Instantly see who owes whom with a clear, color-coded balance summary for both personal and group debts.
  * **📈 Simplified Settlements:** Automatically calculates the most efficient way for everyone in the group to settle up, minimizing the number of transactions.
  * **🌐 Offline-First Functionality:** Works seamlessly without an internet connection. New expenses are saved locally and synced automatically when you reconnect.
  * **🔄 Real-time Updates:** Keep your data instantly updated across all screens with a simple pull-to-refresh gesture.
  * **📜 Unified Transaction History:** View a unified timeline of all expenses and payments, neatly organized by date with category-specific icons.
  * **👤 Secure Authentication:** A secure login system with session management and a quick-access profile modal for logging out.
  * **📱 Modern Mobile UI:** A polished, dark-mode interface designed from the ground up for an intuitive mobile experience, featuring smooth, flicker-free animations.
  * **⚙️ Sync Status:** A dedicated modal to view the status of your offline queue and a history of successfully synced items.
  * **👑 Role-Based Access:** The system supports an "admin" role with exclusive permissions to add group expenses.

## 🛠️ Tech Stack

  * **Frontend:**
      * React Native
      * React Navigation (for routing and tabs)
      * React Context API (for authentication management)
      * `@react-native-community/blur` (for UI effects)
      * `date-fns` (for date formatting on the server)
  * **Backend:**
      * Node.js with Express.js
      * Google Sheets API (as the database)
      * JSON Web Tokens (JWT) (for authentication)
      * bcrypt.js (for password hashing)

## Prerequisites

Before you begin, ensure you have the following installed on your development machine:

  * [Node.js](https://nodejs.org/) (LTS version)
  * JDK (Java Development Kit)
  * Android Studio (for the Android SDK and emulator)
  * React Native CLI

For a detailed guide on setting up your environment, please follow the **"React Native CLI"** instructions on the [official React Native website](https://reactnative.dev/docs/environment-setup).

## 🚀 Setup & Installation

1.  **Clone the repository:**

    ```bash
    git clone <your-repository-url>
    cd <your-project-directory>
    ```

2.  **Install Frontend Dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Icons (for Android):**
    For the icons to appear correctly, you must add the following line to the bottom of your `android/app/build.gradle` file:

    ```groovy
    apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
    ```

4.  **Backend Setup:**

      * Ensure your Node.js server is set up with a `.env` file containing your `JWT_SECRET` and `SPREADSHEET_ID`.
      * Make sure your `credentials.json` file for the Google Sheets API is in the server's directory.

## ▶️ Running the Application

You will need two terminal windows to run the application.

1.  **Start the Backend Server:**
    Navigate to your server directory and run:

    ```bash
    node server.js
    ```

2.  **Start the Metro Bundler:**
    In a new terminal, navigate to the root of your React Native project and run:

    ```bash
    npx react-native start
    ```

3.  **Run the Android App:**
    In another new terminal, navigate to the project root and run:

    ```bash
    npx react-native run-android
    ```

    This will build the app and install it on your connected Android device or emulator.

## 📁 Project Structure

The frontend source code is located in the `/src` directory, organized as follows:

```
/src
├── /api           # API calls and offline queue logic
├── /components    # Reusable components (Cards, Modals, Avatars)
├── /context       # Global state management (AuthContext)
├── /navigation    # React Navigation configuration (Tab Navigator)
└── /screens       # Top-level screen components (Login, Dashboard, Tabs)
```

## 📝 License

This project is licensed under the MIT License.