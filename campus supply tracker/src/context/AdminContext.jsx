import { createContext, useContext, useState, useEffect } from 'react'

import { auth, googleProvider, db } from '../firebase'

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'

import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore'

const ADMIN_PROFILE_KEY = 'sisAdminProfile'
const LOGGED_IN_KEY = 'sisIsLoggedIn'
const ADMIN_ACCOUNTS_KEY = 'sisAdminAccounts'

const defaultAdminUser = {
  username: '',
  role: 'Admin',
  name: '',
  email: '',
  image: '',
}

const defaultAdminAccounts = [
  {
    id: 'adm-001',
    username: 'admin',
    role: 'Admin',
    name: 'Primary Campus Admin',
    email: 'admin@campussupply.edu',
    dateCreated: '2026-01-15',
    status: 'Active',
  },
  {
    id: 'adm-002',
    username: 'custodian_jane',
    role: 'Admin',
    name: 'Jane Custodian',
    email: 'jane.custodian@campussupply.edu',
    dateCreated: '2026-02-01',
    status: 'Active',
  },
  {
    id: 'adm-003',
    username: 'assistant_mark',
    role: 'Admin',
    name: 'Mark Assistant',
    email: 'mark.assistant@campussupply.edu',
    dateCreated: '2026-02-18',
    status: 'Inactive',
  },
  {
    id: 'adm-004',
    username: 'supply_clerk_maria',
    role: 'Admin',
    name: 'Maria Santos',
    email: 'maria.santos@campussupply.edu',
    dateCreated: '2026-03-05',
    status: 'Active',
  },
]

const AdminContext = createContext(null)

export function AdminProvider({ children }) {
  const [admin, setAdminState] = useState(() => {
    try {
      const saved = localStorage.getItem(ADMIN_PROFILE_KEY)
      return saved ? JSON.parse(saved) : defaultAdminUser
    } catch {
      return defaultAdminUser
    }
  })

  const [adminAccounts, setAdminAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem(ADMIN_ACCOUNTS_KEY)
      return saved ? JSON.parse(saved) : defaultAdminAccounts
    } catch {
      return defaultAdminAccounts
    }
  })

  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem(LOGGED_IN_KEY) === 'true'
  )

  useEffect(() => {
    localStorage.setItem(
      ADMIN_PROFILE_KEY,
      JSON.stringify(admin)
    )
  }, [admin])

  useEffect(() => {
    localStorage.setItem(
      ADMIN_ACCOUNTS_KEY,
      JSON.stringify(adminAccounts)
    )
  }, [adminAccounts])

  useEffect(() => {
    localStorage.setItem(
      LOGGED_IN_KEY,
      String(isLoggedIn)
    )
  }, [isLoggedIn])

  function updateAdmin(fields) {
    setAdminState((prev) => ({
      ...prev,
      ...fields,
    }))
  }

  async function getUserProfile(firebaseUser) {
    if (!firebaseUser) {
      return null
    }

    const userRef = doc(db, 'users', firebaseUser.uid)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const data = userSnap.data()

      return {
        uid: firebaseUser.uid,
        username:
          data.username ||
          firebaseUser.email?.split('@')[0] ||
          '',
        role: data.role || 'Admin',
        name:
          data.name ||
          firebaseUser.displayName ||
          'Campus Admin',
        email:
          data.email ||
          firebaseUser.email ||
          '',
        image:
          data.image ||
          firebaseUser.photoURL ||
          '',
      }
    }

    const newProfile = {
      uid: firebaseUser.uid,
      username:
        firebaseUser.email?.split('@')[0] || '',
      role: 'Admin',
      name:
        firebaseUser.displayName ||
        'Campus Admin',
      email:
        firebaseUser.email || '',
      image:
        firebaseUser.photoURL || '',
    }

    await setDoc(userRef, {
      ...newProfile,
      createdAt: new Date().toISOString(),
    })

    return newProfile
  }

  function applyUserProfile(userProfile) {
    setAdminState(userProfile)
    setIsLoggedIn(true)
  }

  async function signup(
    name,
    username,
    email,
    password
  ) {
    try {
      const result =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        )

      const firebaseUser = result.user

      await updateProfile(firebaseUser, {
        displayName: name,
      })

      const userProfile = {
        uid: firebaseUser.uid,
        username,
        role: 'Admin',
        name,
        email: firebaseUser.email,
        image: firebaseUser.photoURL || '',
      }

      await setDoc(
        doc(db, 'users', firebaseUser.uid),
        {
          ...userProfile,
          createdAt: new Date().toISOString(),
        }
      )

      applyUserProfile(userProfile)

      return {
        success: true,
        role: 'Admin',
      }
    } catch (error) {
      console.error('Signup failed:', error)

      let message = 'Sign up failed. Please try again.'

      if (error.code === 'auth/email-already-in-use') {
        message = 'This email is already registered.'
      } else if (error.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.'
      } else if (error.code === 'auth/weak-password') {
        message = 'Password must be at least 6 characters.'
      }

      return {
        success: false,
        error: message,
      }
    }
  }

  async function login(email, password) {
    try {
      const result =
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        )

      const userProfile =
        await getUserProfile(result.user)

      applyUserProfile(userProfile)

      return {
        success: true,
        role: userProfile.role,
      }
    } catch (error) {
      console.error('Login failed:', error)

      let message = 'Invalid email or password.'

      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        message = 'Invalid email or password.'
      } else if (error.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.'
      }

      return {
        success: false,
        error: message,
      }
    }
  }

  async function loginWithGoogle() {
    try {
      const result =
        await signInWithPopup(
          auth,
          googleProvider
        )

      const userProfile =
        await getUserProfile(result.user)

      applyUserProfile(userProfile)

      return {
        success: true,
        role: userProfile.role,
      }
    } catch (error) {
      console.error(
        'Google login failed:',
        error
      )

      return {
        success: false,
        error: error.message,
      }
    }
  }

  async function signupWithGoogle() {
    try {
      const result =
        await signInWithPopup(
          auth,
          googleProvider
        )

      const firebaseUser = result.user

      const userRef =
        doc(db, 'users', firebaseUser.uid)

      const userSnap =
        await getDoc(userRef)

      let userProfile

      if (userSnap.exists()) {
        userProfile =
          await getUserProfile(firebaseUser)
      } else {
        userProfile = {
          uid: firebaseUser.uid,
          username:
            firebaseUser.email?.split('@')[0] || '',
          role: 'Admin',
          name:
            firebaseUser.displayName ||
            'Campus Admin',
          email:
            firebaseUser.email || '',
          image:
            firebaseUser.photoURL || '',
        }

        await setDoc(userRef, {
          ...userProfile,
          createdAt: new Date().toISOString(),
        })
      }

      applyUserProfile(userProfile)

      return {
        success: true,
        role: userProfile.role,
      }
    } catch (error) {
      console.error(
        'Google signup failed:',
        error
      )

      return {
        success: false,
        error: error.message,
      }
    }
  }

  function deleteAdminAccount(id) {
    setAdminAccounts((prev) =>
      prev.filter(
        (acc) => acc.id !== id
      )
    )

    return true
  }

  function addAdminAccount(account) {
    const newAccount = {
      id: `adm-${Date.now()}`,
      role: 'Admin',
      status: 'Active',
      dateCreated:
        new Date()
          .toISOString()
          .split('T')[0],
      ...account,
    }

    setAdminAccounts((prev) => [
      newAccount,
      ...prev,
    ])

    return newAccount
  }

  function toggleAdminStatus(id) {
    setAdminAccounts((prev) =>
      prev.map((acc) =>
        acc.id === id
          ? {
              ...acc,
              status:
                acc.status === 'Active'
                  ? 'Inactive'
                  : 'Active',
            }
          : acc
      )
    )
  }

  async function logout() {
    try {
      await signOut(auth)
    } catch (error) {
      console.error(
        'Logout failed:',
        error
      )
    }

    setIsLoggedIn(false)
    setAdminState(defaultAdminUser)

    localStorage.removeItem(
      ADMIN_PROFILE_KEY
    )

    localStorage.removeItem(
      LOGGED_IN_KEY
    )
  }

  const isSuperadmin =
    admin?.role === 'Superadmin'

  const value = {
    admin,
    currentUser: admin,
    isSuperadmin,
    adminAccounts,
    updateAdmin,
    isLoggedIn,
    signup,
    signupWithGoogle,
    login,
    loginWithGoogle,
    deleteAdminAccount,
    addAdminAccount,
    toggleAdminStatus,
    logout,
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  return useContext(AdminContext)
}