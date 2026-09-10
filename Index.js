import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, serverTimestamp, onValue, update } from "firebase/database";
import { Star, CheckCircle, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

// ==========================================
// 1. FIREBASE CONFIGURATION
// Replace with your actual project keys
// ==========================================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// ==========================================
// 2. STUDENT FEEDBACK FORM
// ==========================================
function StudentFeedback() {
  const [hall, setHall] = useState("North Dining Hall");
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState("Food Quality");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return alert("Please select a rating!");

    const feedbackRef = ref(database, "feedbacks");
    push(feedbackRef, {
      hall,
      rating,
      category,
      comment,
      timestamp: serverTimestamp(),
      status: "Pending"
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRating(0);
      setComment("");
    }, 3000);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg border border-gray-100 mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Campus Dining Feedback</h2>
      <p className="text-sm text-gray-500 mb-6">Let kitchen management know how your meal is!</p>

      {submitted ? (
        <div className="flex flex-col items-center justify-center py-8 text-green-600">
          <CheckCircle className="w-16 h-16 mb-2" />
          <p className="text-lg font-semibold">Feedback Sent!</p>
          <p className="text-xs text-gray-500">Kitchen management notified in real time.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Dining Hall</label>
            <select 
              value={hall} 
              onChange={(e) => setHall(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>North Dining Hall</option>
              <option>South Mess Hall</option>
              <option>Central Campus Food Court</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star 
                    className={`w-8 h-8 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Category</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Food Quality</option>
              <option>Hygiene / Cleanliness</option>
              <option>Utensils Availability</option>
              <option>Staff Behavior</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Comment / Specific Issue</label>
            <textarea
              rows="3"
              placeholder="e.g., Cold chicken served, dirty tables near entrance..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Submit Feedback
          </button>
        </form>
      )}
    </div>
  );
}

// ==========================================
// 3. MANAGER DASHBOARD
// ==========================================
function ManagerDashboard() {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const feedbackRef = ref(database, "feedbacks");
    const unsubscribe = onValue(feedbackRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedData = Object.entries(data).map(([id, val]) => ({
          id,
          ...val
        })).reverse();
        setFeedbacks(formattedData);
      } else {
        setFeedbacks([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = (id, newStatus) => {
    const itemRef = ref(database, `feedbacks/${id}`);
    update(itemRef, { status: newStatus });
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Kitchen Operations Dashboard</h1>
          <p className="text-sm text-gray-500">Real-time student feedback feeds</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-red-50 border border-red-200 px-4 py-2 rounded-lg text-center">
            <span className="text-xs text-red-600 font-semibold block uppercase">Critical Alerts</span>
            <span className="text-xl font-bold text-red-700">
              {feedbacks.filter(f => f.rating <= 2 && f.status === "Pending").length}
            </span>
          </div>
          <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg text-center">
            <span className="text-xs text-blue-600 font-semibold block uppercase">Total Submissions</span>
            <span className="text-xl font-bold text-blue-700">{feedbacks.length}</span>
          </div>
        </div>
      </header>

      <div className="space-y-3">
        {feedbacks.length === 0 ? (
          <p className="text-gray-400 text-center py-10">No feedback submitted yet.</p>
        ) : (
          feedbacks.map((item) => {
            const isCritical = item.rating <= 2;
            return (
              <div 
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between ${
                  isCritical && item.status === "Pending" 
                    ? "bg-red-50 border-red-300 shadow-md animate-pulse" 
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${isCritical ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}>
                    {isCritical ? <AlertTriangle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{item.hall}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-amber-500 font-bold my-0.5">
                      {"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{item.comment || "No comment provided."}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    item.status === "Pending" ? "bg-amber-100 text-amber-700" :
                    item.status === "Acknowledged" ? "bg-blue-100 text-blue-700" :
                    "bg-green-100 text-green-700"
                  }`}>
                    {item.status}
                  </span>

                  <div className="flex gap-2">
                    {item.status === "Pending" && (
                      <button 
                        onClick={() => updateStatus(item.id, "Acknowledged")}
                        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
                      >
                        Acknowledge
                      </button>
                    )}
                    {item.status !== "Resolved" && (
                      <button 
                        onClick={() => updateStatus(item.id, "Resolved")}
                        className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ==========================================
// 4. MAIN APP CONTAINER
// ==========================================
export default function App() {
  const [view, setView] = useState("student");

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
        <span className="font-bold text-lg tracking-wide">Smart Campus Ecosystem</span>
        <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setView("student")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              view === "student" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Student View
          </button>
          <button
            onClick={() => setView("manager")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              view === "manager" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Manager Dashboard
          </button>
        </div>
      </nav>

      <main>
        {view === "student" ? <StudentFeedback /> : <ManagerDashboard />}
      </main>
    </div>
  );
}