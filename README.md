# Divvy Backend

<div align="center">
  <img src="/src/img/divvylogo.png" alt="Divvy Backend Logo" width="300">
</div>

**Divvy Backend** serves as the backbone for the Divvy expense-splitting application, handling all server-side logic and database interactions. It ensures secure and efficient management of user data, expenses, and receipts, supporting the seamless functionality of the Divvy app.

## Features

- **User Authentication:** Securely manage user sessions and protect personal information using AWS Cognito.
- **Expense and Receipt Management:** Process and store expenses and receipt data, allowing users to track and manage their shared expenses efficiently.
- **API Integration:** Utilize the Mindee Receipt API for intelligent receipt scanning and data extraction, enhancing the user experience by simplifying expense entries.
- **Scalable Database:** Employ AWS DynamoDB for a scalable, high-performance NoSQL database solution to handle growing data needs.
- **Serverless Architecture:** Leverage AWS Lambda and API Gateway for a serverless backend architecture, ensuring scalability and cost-effectiveness.

## Technologies Used

- **Node.js:** For building the backend server with a non-blocking, event-driven architecture.
- **Express.js:** A web application framework for Node.js, designed for building web applications and APIs.
- **AWS Lambda & API Gateway:** For creating a serverless architecture that automatically scales and manages the infrastructure.
- **AWS DynamoDB:** A fully managed NoSQL database service that provides fast and predictable performance with seamless scalability.
- **AWS Cognito:** For adding user sign-up, sign-in, and access control to web and mobile apps quickly and easily.

## Getting Started

To set up the Divvy Backend for local development, follow these instructions:

1. **Clone the repository:**

    ```bash
    git clone https://github.com/DevinLed/Billsplit-backend.git
    ```

2. **Navigate to the project directory:**

    ```bash
    cd Billsplit-backend
    ```

3. **Install dependencies:**

    ```bash
    npm install
    ```

4. **Configure environment variables:** Copy the `.env.example` file to a new file named `.env` and update the variables with your AWS credentials and other necessary configurations.

5. **Run the server locally:**

    ```bash
    npm start
    ```

6. **Access the API:** The backend API will now be accessible at `http://localhost:3001`.

## Contributing

We welcome contributions to the Divvy Backend! Whether it's submitting a bug report, proposing a feature, or contributing code, here's how you can get involved:

1. **Fork the repository.**
2. **Create a new branch for your feature or fix:** 

    ```bash
    git checkout -b feature/your-feature-name
    ```

3. **Commit your changes:**

    ```bash
    git commit -am 'Add a new feature'
    ```

4. **Push to your branch:**

    ```bash
    git push origin feature/your-feature-name
    ```

5. **Submit a pull request.**

## License

This project is open-source.

## Acknowledgements

A huge thank you to Devin Marsh, whose expertise and guidance were crucial in the development of the Divvy Backend. His support made it possible to implement a robust and scalable backend solution that enhances the overall functionality of the Divvy app.
