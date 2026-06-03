import {useEffect, useState, useRef} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {deleteMessage, listMessage, postMessage, updateMessage} from "../../api/messageApi.js";
import TimeAgo from "react-timeago";
import buildFormatter from "react-timeago/formatters/buildFormatter";
import frenchStrings from "react-timeago/lib/language-strings/fr"
import {FaEdit, FaTrash, FaUserCircle, FaPaperPlane, FaTimes, FaSpinner, FaSmile} from 'react-icons/fa'
import EmojiPicker from 'emoji-picker-react';

const formatter = buildFormatter(frenchStrings)

function MessageListPage({user}) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  // Auto-scroll en bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleEditMessage = (message) => {
    setEditingMessage(message)
    setEditContent(message.content)
  }

  const handleUpdateMessage = async () => {
    const response = await updateMessage(editingMessage.id, {content: editContent})
    if (response) {
      setMessages(messages.map(msg =>
        msg.id === editingMessage.id ? {...msg, content: editContent} : msg
      ))
      setEditingMessage(null)
      setEditContent('')
    }
  }

  const handleSubmitMessage = async (e) => {
    e.preventDefault()
    if (!message.trim()) return

    setSubmitting(true)
    const response = await postMessage({content: message})
    if (response) {
      setMessages(prev => [...prev, response.data])
      setMessage('')
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
    setSubmitting(false)
    setShowEmojiPicker(false)
  }

  const handleDeleteMessage = async (id) => {
    if (!confirm("Voulez vous vraiment supprimer ce message?")) return

    const response = await deleteMessage(id)
    if (response) {
      setMessages(prevState => prevState.filter(message => message.id !== id))
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitMessage(e)
    }
  }

  const onEmojiClick = (emojiObject) => {
    setMessage(prev => prev + emojiObject.emoji)
    setShowEmojiPicker(false)
    textareaRef.current?.focus()
  }

  // Auto-resize textarea
  const handleTextareaChange = (e) => {
    setMessage(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const loadMessages = async () => {
    setLoading(true)
    const response = await listMessage()
    if (response) {
      setMessages(response.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadMessages()
  }, []);

  // Variants pour animations Framer Motion
  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 20 }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header avec stats */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-md px-6 sticky top-0 z-10"
      >
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Déclinaison Messenger
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {messages.length} message{messages.length > 1 ? 's' : ''}
          </p>
        </div>
      </motion.div>

      {/* Zone des messages - scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <FaSpinner className="text-blue-500 text-3xl" />
              </motion.div>
            </div>
          ) : messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">💬</div>
              <p className="text-gray-400 font-medium">Aucun message pour le moment</p>
              <p className="text-gray-400 text-sm mt-1">Soyez le premier à poster !</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {messages.map((message, index) => {
                const isLeft = index % 2 === 0
                const isCurrentUser = message.user?.username === user?.username || isLeft

                return (
                  <motion.div
                    key={message.id}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`flex ${isLeft ? 'justify-start' : 'justify-end'} group`}
                  >
                    <div className={`max-w-[80%] ${isLeft ? 'mr-auto' : 'ml-auto'}`}>
                      {/* Bulle de message */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`
                          relative rounded-2xl p-3 transition-all duration-200
                          ${isLeft
                            ? 'bg-white rounded-tl-none shadow-md border border-gray-100'
                            : 'bg-gradient-to-br from-blue-500 to-blue-600 rounded-br-none shadow-md'
                          }
                        `}
                      >
                        <p className={`${isLeft ? 'text-gray-700' : 'text-white'} pr-16 break-words`}>
                          {message.content}
                        </p>

                        {/* Boutons d'action */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEditMessage(message)}
                            className={`p-1.5 rounded-full transition-all ${
                              isLeft
                                ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                : 'bg-blue-400 hover:bg-blue-300 text-white'
                            }`}
                            title="Modifier"
                          >
                            <FaEdit size={12}/>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteMessage(message.id)}
                            className={`p-1.5 rounded-full transition-all ${
                              isLeft
                                ? 'bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600'
                                : 'bg-blue-400 hover:bg-red-500 text-white'
                            }`}
                            title="Supprimer"
                          >
                            <FaTrash size={12}/>
                          </motion.button>
                        </div>
                      </motion.div>

                      {/* Infos du message */}
                      <div className={`flex items-center gap-2 mt-1 text-xs ${
                        isLeft ? 'justify-start' : 'justify-end'
                      }`}>
                        <FaUserCircle className="text-gray-400" size={12}/>
                        <span className="text-gray-500 font-medium">
                          {isCurrentUser ? user?.username || 'Utilisateur' : 'Invité'}
                        </span>
                        <span className="text-gray-300">•</span>
                        <TimeAgo date={message.date} formatter={formatter} className="text-gray-400"/>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Formulaire d'édition (modal) */}
      <AnimatePresence>
        {editingMessage && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setEditingMessage(null)}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Modifier le message</h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditingMessage(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes size={20}/>
                </motion.button>
              </div>
              <textarea
                className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50"
                rows="4"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end gap-3 mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEditingMessage(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpdateMessage}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-sm"
                >
                  Enregistrer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulaire d'envoi - FIXE EN BAS */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-t border-gray-200 shadow-lg sticky bottom-0 z-10"
      >
        <div className="max-w-3xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmitMessage}>
            <div className="relative flex items-end gap-2">
              {/* Bouton émoji */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-2"
              >
                <FaSmile size={22}/>
              </motion.button>

              {/* Textarea */}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  className="w-full border border-gray-200 rounded-xl py-2.5 pl-3 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50 max-h-32"
                  rows="1"
                  placeholder="Écrivez votre message..."
                  value={message}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  disabled={submitting}
                  style={{ overflow: 'auto' }}
                />

                {/* Picker émoji */}
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.95 }}
                      className="absolute bottom-16 right-0 z-20"
                    >
                      <EmojiPicker onEmojiClick={onEmojiClick} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bouton envoi */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={submitting || !message.trim()}
                className={`
                  flex-shrink-0 rounded-xl font-medium transition-all flex items-center gap-2 px-5 py-2.5
                  ${submitting || !message.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md'
                  }
                `}
              >
                {submitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <FaSpinner size={16}/>
                  </motion.div>
                ) : (
                  <FaPaperPlane size={16}/>
                )}
              </motion.button>
            </div>

            {/* Indicateur de frappe */}
            <AnimatePresence>
              {message.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-right text-xs text-gray-400 mt-2"
                >
                  {message.length} caractères • Entrée pour envoyer
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default MessageListPage