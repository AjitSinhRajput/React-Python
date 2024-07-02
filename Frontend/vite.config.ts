import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "192.168.0.184", // Specify your custom IP address here
    port: 3000, // Optional: Specify the port number
  },
});
