# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Recent Refactoring: Decoupling Data Access Layer

### What We've Done

1. **Created a Data Repository Interface**: We've defined a `FoodRepository` interface that abstracts the data operations for our food diary app.

2. **Implemented SQLite Repository**: We've created a `SQLiteFoodRepository` class that implements the `FoodRepository` interface, encapsulating all SQLite-specific operations.

3. **Introduced Dependency Injection**: We've set up a context (`FoodRepositoryContext`) to provide the repository instance throughout the app.

4. **Updated Components**: We've refactored our main components (HomeScreen, DiaryScreen, FoodInfoScreen) to use the new repository pattern instead of direct SQLite operations.

5. **Separated Database Initialization**: We've moved database initialization and migration logic into separate modules.

### Why We Did It

1. **Separation of Concerns**: By decoupling the data access layer from our components, we've made our code more modular and easier to maintain.

2. **Flexibility**: The repository pattern allows us to easily switch out our data source in the future. For example, we could replace SQLite with a remote API without changing our component logic.

3. **Testability**: With this abstraction, we can more easily mock our data layer for unit testing our components.

4. **Scalability**: As our app grows, this structure will make it easier to manage and extend our data operations.

5. **Consistency**: By centralizing our data access logic, we ensure consistent data handling across the app.

6. **Preparedness for Future Changes**: This structure sets us up well for potential future requirements, such as offline-first capabilities or synchronization with a backend server.

### Benefits for Future Development

- **Easier Onboarding**: New developers can understand the app's structure more quickly, with clear separation between UI and data logic.
- **Simpler Maintenance**: Bug fixes and feature additions in the data layer can be made without touching UI components, and vice versa.
- **Enhanced Collaboration**: Team members can work on different layers of the app simultaneously with reduced risk of conflicts.
- **Improved Performance Optimization**: With a centralized data layer, it's easier to implement and manage caching strategies.

### Next Steps

- Implement comprehensive unit tests for the repository and components.
- Consider adding more advanced features like data caching or offline support.
- Explore integrating with a remote backend API as a data source.

This refactoring sets a solid foundation for the continued development and scaling of our food diary app, ensuring it remains maintainable and adaptable to future requirements.
