import React, { useState } from 'react';
import { ArrowRight, Check, Clock, Target, Zap, Heart } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  questions: Array<{
    id: string;
    question: string;
    options: Array<{
      value: string;
      label: string;
      description?: string;
    }>;
  }>;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to DeskLamp! 🌟',
    description: "Let's personalize your focus and break experience",
    icon: <Heart className="w-8 h-8 text-blue-500" />,
    questions: [
      {
        id: 'experience',
        question: "What's your experience with focus techniques?",
        options: [
          {
            value: 'beginner',
            label: 'Beginner',
            description: 'New to focus techniques',
          },
          {
            value: 'intermediate',
            label: 'Intermediate',
            description: 'Some experience with focus methods',
          },
          {
            value: 'advanced',
            label: 'Advanced',
            description: 'Experienced with various techniques',
          },
        ],
      },
    ],
  },
  {
    id: 'focus',
    title: 'Focus Preferences 🎯',
    description: 'Tell us about your focus habits',
    icon: <Target className="w-8 h-8 text-blue-500" />,
    questions: [
      {
        id: 'session_length',
        question: 'How long do you typically focus?',
        options: [
          { value: '15', label: '15 minutes', description: 'Quick bursts' },
          { value: '25', label: '25 minutes', description: 'Pomodoro style' },
          { value: '45', label: '45 minutes', description: 'Extended focus' },
          {
            value: '60',
            label: '60+ minutes',
            description: 'Deep work sessions',
          },
        ],
      },
      {
        id: 'distractions',
        question: 'What distracts you most?',
        options: [
          {
            value: 'social',
            label: 'Social Media',
            description: 'Facebook, Twitter, Instagram',
          },
          {
            value: 'news',
            label: 'News Sites',
            description: 'News websites and blogs',
          },
          {
            value: 'entertainment',
            label: 'Entertainment',
            description: 'YouTube, Netflix, games',
          },
          {
            value: 'shopping',
            label: 'Shopping',
            description: 'Online stores and deals',
          },
        ],
      },
    ],
  },
  {
    id: 'breaks',
    title: 'Break Preferences ☕',
    description: 'How do you like to recharge?',
    icon: <Zap className="w-8 h-8 text-blue-500" />,
    questions: [
      {
        id: 'break_length',
        question: 'How long do you prefer breaks?',
        options: [
          { value: '5', label: '5 minutes', description: 'Quick refresh' },
          { value: '10', label: '10 minutes', description: 'Short break' },
          { value: '15', label: '15 minutes', description: 'Standard break' },
          { value: '30', label: '30 minutes', description: 'Extended break' },
        ],
      },
      {
        id: 'break_activities',
        question: 'What do you like to do during breaks?',
        options: [
          {
            value: 'breathing',
            label: 'Breathing Exercises',
            description: 'Mindful breathing',
          },
          {
            value: 'stretching',
            label: 'Stretching',
            description: 'Physical movement',
          },
          { value: 'walking', label: 'Walking', description: 'Light exercise' },
          {
            value: 'meditation',
            label: 'Meditation',
            description: 'Mindfulness practice',
          },
        ],
      },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications 🔔',
    description: 'Stay informed about your progress',
    icon: <Clock className="w-8 h-8 text-blue-500" />,
    questions: [
      {
        id: 'notification_preference',
        question: 'How would you like to be notified?',
        options: [
          {
            value: 'all',
            label: 'All Notifications',
            description: 'Focus start, breaks, and reminders',
          },
          {
            value: 'important',
            label: 'Important Only',
            description: 'Session completion and breaks',
          },
          {
            value: 'minimal',
            label: 'Minimal',
            description: 'Only session completion',
          },
          {
            value: 'none',
            label: 'No Notifications',
            description: 'Silent mode',
          },
        ],
      },
    ],
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const currentStepData = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Save onboarding data to storage
      await chrome.storage.local.set({
        onboardingCompleted: true,
        onboardingData: answers,
        onboardingDate: new Date().toISOString(),
      });

      // Set default settings based on answers
      const defaultSettings = generateDefaultSettings(answers);
      await chrome.storage.local.set(defaultSettings);

      setIsCompleted(true);

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = chrome.runtime.getURL('src/newtab/index.html');
      }, 2000);
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  const generateDefaultSettings = (answers: Record<string, string>) => {
    const settings: Record<string, any> = {};

    // Focus session length
    if (answers.session_length) {
      settings.defaultFocusDuration = parseInt(answers.session_length) * 60; // Convert to seconds
    }

    // Break length
    if (answers.break_length) {
      settings.defaultBreakDuration = parseInt(answers.break_length) * 60; // Convert to seconds
    }

    // Blocked sites based on distractions
    if (answers.distractions) {
      const distractionSites = {
        social: [
          { url: 'facebook.com', name: 'Facebook' },
          { url: 'twitter.com', name: 'Twitter' },
          { url: 'instagram.com', name: 'Instagram' },
          { url: 'linkedin.com', name: 'LinkedIn' },
        ],
        news: [
          { url: 'reddit.com', name: 'Reddit' },
          { url: 'cnn.com', name: 'CNN' },
          { url: 'bbc.com', name: 'BBC' },
        ],
        entertainment: [
          { url: 'youtube.com', name: 'YouTube' },
          { url: 'netflix.com', name: 'Netflix' },
          { url: 'twitch.tv', name: 'Twitch' },
        ],
        shopping: [
          { url: 'amazon.com', name: 'Amazon' },
          { url: 'ebay.com', name: 'eBay' },
        ],
      };

      const sitesToBlock =
        distractionSites[
          answers.distractions as keyof typeof distractionSites
        ] || [];
      settings.blockedSites = sitesToBlock;
    }

    // Notification preferences
    if (answers.notification_preference) {
      settings.notifications = {
        enabled: answers.notification_preference !== 'none',
        focusStart: ['all', 'important'].includes(
          answers.notification_preference
        ),
        focusComplete: true,
        breakReminder: ['all', 'important'].includes(
          answers.notification_preference
        ),
      };
    }

    return settings;
  };

  const getStepProgress = () => {
    return ((currentStep + 1) / onboardingSteps.length) * 100;
  };

  const isStepComplete = () => {
    return currentStepData.questions.every(
      question => answers[question.id] !== undefined
    );
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-sky-50 to-blue-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white/80 backdrop-blur-lg border border-white/40 rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              All Set! 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              Your DeskLamp experience has been personalized. Redirecting to
              your dashboard...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full animate-pulse"
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-100 via-indigo-100 to-sky-100 font-display">
      {/* Progress Bar - Top Level */}
      <div className="w-full py-6">
        <div className="max-w-3xl mx-auto px-4">
          <div className="w-full bg-blue-300/50 backdrop-blur-lg rounded-lg h-2 shadow-inner">
            <div
              className="bg-linear-to-r from-blue-500 to-blue-600 h-2 rounded-lg transition-all duration-500 ease-out"
              style={{ width: `${getStepProgress()}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/80 backdrop-blur-lg border border-white/40 rounded-full shadow-lg mb-4">
            {currentStepData.icon}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentStepData.title}
          </h1>
          <p className="text-gray-600 text-lg">{currentStepData.description}</p>
        </div>

        {/* Questions */}
        <div className="max-w-2xl mx-auto">
          {currentStepData.questions.map((question, questionIndex) => (
            <div key={question.id} className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {question.question}
              </h3>
              <div className="grid gap-3">
                {question.options.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(question.id, option.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      answers[question.id] === option.value
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-white/50 bg-white/80 backdrop-blur-lg hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {option.label}
                        </div>
                        {option.description && (
                          <div className="text-sm text-gray-600 mt-1">
                            {option.description}
                          </div>
                        )}
                      </div>
                      {answers[question.id] === option.value && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="max-w-2xl mx-auto flex justify-between items-center mt-8">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/80 backdrop-blur-lg border border-white/60'
            }`}
          >
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!isStepComplete()}
            className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
              isStepComplete()
                ? 'bg-linear-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLastStep ? 'Complete Setup' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
