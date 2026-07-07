import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUserContext } from '../context/user.context'
import useProject from '../hooks/useProject'
import useGitHub from '../hooks/useGitHub'

import CollaboratorsModal    from '../components/CollaboratorsModal'
import GitHubPushModal       from '../components/GitHubPushModal'
import SidePanel             from '../components/SidePanel'
import SyntaxHighlightedCode from '../components/SyntaxHighlightedCode'
import Preview               from '../components/Preview'
import FileExplorer          from '../components/FileExplorer'
import ChatSection           from '../components/ChatSection'
import CodeEditor            from '../components/CodeEditor'

import Markdown from 'markdown-to-jsx'
import { getWebContainer }                                              from '../config/webContainer'
import { initializeSocket, receiveMessage, sendMessage, socketInstance } from '../config/socket'


const Project = () => {

    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useUserContext()
    const { fetchProject, fetchUsers, addCollaborators, saveFileTree } = useProject()
    const { pushToGitHub, loading: githubLoading, error: githubError, repoUrl, clearResult } = useGitHub()

    const [isSidePanelOpen, setIsSidePanelOpen]    = useState(false)
    const [isModalOpen, setIsModalOpen]             = useState(false)
    const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false)
    const [selectedUserId, setSelectedUserId]       = useState(new Set())
    const [project, setProject]                     = useState(location.state?.project || null)
    const [message, setMessage]                     = useState('')
    const [users, setUsers]                         = useState([])
    const [messages, setMessages]                   = useState([])
    const [fileTree, setFileTree]                   = useState({})
    const [currentFile, setCurrentFile]             = useState(null)
    const [openFiles, setOpenFiles]                 = useState([])
    const [iframeUrl, setIframeUrl]                 = useState(null)
    const [isRunning, setIsRunning]                 = useState(false)
    const [startCommand, setStartCommand]           = useState(null)
    const [isAiTyping, setIsAiTyping]               = useState(false)
    const [terminalOutput, setTerminalOutput]       = useState([])
    const [githubSuccess, setGithubSuccess]         = useState(null)

    const messageBox      = useRef(null)
    const runProcessRef   = useRef(null)
    const webContainerRef = useRef(null)
    const terminalRef     = useRef(null)

    // If project state lost on refresh, bounce home
    useEffect(() => {
        if (!project) {
            navigate('/')
        }
    }, [])

    const handleUserClick = (id) => {
        setSelectedUserId(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    const handleAddCollaborators = async () => {
        const result = await addCollaborators(project._id, Array.from(selectedUserId))
        if (result.success) {
            setIsModalOpen(false)
            setSelectedUserId(new Set())
        }
    }

    const send = () => {
        if (!message.trim()) return
        sendMessage('project-message', { message, sender: user })
        setMessages(prev => [...prev, { sender: user, message }])
        setMessage('')
        if (message.includes('@ai')) setIsAiTyping(true)
    }

    const handleGitHubPush = async ({ token, repoName, isPrivate }) => {
        const result = await pushToGitHub({ token, repoName, isPrivate, fileTree })
        if (result.success) {
            setIsGitHubModalOpen(false)
            setGithubSuccess(result.repoUrl)
            setTimeout(() => setGithubSuccess(null), 8000)
        }
    }

    function WriteAiMessage(message) {
        try {
            const messageObject = JSON.parse(message)
            return (
                <div className="overflow-auto bg-slate-950 text-white rounded-sm p-2">
                    <Markdown
                        children={messageObject.text}
                        options={{ overrides: { code: SyntaxHighlightedCode } }}
                    />
                </div>
            )
        } catch {
            return (
                <div className="overflow-auto bg-slate-950 text-white rounded-sm p-2">
                    <p>{message}</p>
                </div>
            )
        }
    }

    function scrollToBottom() {
        if (messageBox.current) {
            messageBox.current.scrollTop = messageBox.current.scrollHeight
        }
    }

    useEffect(() => { scrollToBottom() }, [messages])

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight
        }
    }, [terminalOutput])

    // Boot WebContainer exactly once
    useEffect(() => {
        if (!project) return
        if (!webContainerRef.current) {
            getWebContainer().then(container => {
                webContainerRef.current = container
                console.log('container started')
                container.on('server-ready', (port, url) => {
                    console.log(port, url)
                    setIframeUrl(url)
                })
            })
        }
    }, [])

    // Socket setup
    useEffect(() => {
        if (!project) return

        initializeSocket(project._id)

        receiveMessage('project-message', data => {
            if (data.sender._id === 'ai') {
                setIsAiTyping(false)
                try {
                    const parsed = JSON.parse(data.message)
                    if (parsed.fileTree) {
                        setFileTree(parsed.fileTree)
                        webContainerRef.current?.mount(parsed.fileTree)
                    }
                    if (parsed.startCommand) {
                        setStartCommand(parsed.startCommand)
                    }
                } catch {}
                runProcessRef.current = null
                setIsRunning(false)
                setMessages(prev => [...prev, data])
            } else {
                setMessages(prev => [...prev, data])
            }
        })

        receiveMessage('file-tree-update', data => {
            setFileTree(data.fileTree)
            webContainerRef.current?.mount(data.fileTree)
        })

        return () => {
            socketInstance?.off('project-message')
            socketInstance?.off('file-tree-update')
        }
    }, [project?._id])

    // Load project data + chat history + users on mount
    useEffect(() => {
        if (!project) return
        const loadProject = async () => {
            const projectData = await fetchProject(project._id)
            if (projectData) {
                setProject(projectData)
                setFileTree(projectData.fileTree || {})
                if (projectData.messages) {
                    setMessages(projectData.messages)
                }
            }
            const usersData = await fetchUsers()
            setUsers(usersData)
        }
        loadProject()
    }, [project?._id])

    const handleSaveFileTree = async (ft) => {
        await saveFileTree(project._id, ft)
    }

    if (!project) {
        return (
            <div className="h-screen w-screen flex items-center justify-center">
                Loading project...
            </div>
        )
    }

    return (
        <main className="h-screen w-screen flex flex-col">

            {/* GitHub success banner */}
            {githubSuccess && (
                <div className="flex items-center justify-between bg-green-50 border-b border-green-200 px-4 py-2.5 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <p className="text-sm text-green-700 font-medium">
                            Successfully pushed to GitHub!
                        </p>
                        <a
                            href={githubSuccess}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-green-600 underline hover:text-green-800"
                        >
                            {githubSuccess}
                        </a>
                    </div>
                    <button
                        onClick={() => setGithubSuccess(null)}
                        className="text-green-500 hover:text-green-700 text-lg leading-none"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* GitHub error banner */}
            {githubError && (
                <div className="flex items-center justify-between bg-red-50 border-b border-red-200 px-4 py-2.5 flex-shrink-0">
                    <p className="text-sm text-red-600">{githubError}</p>
                    <button
                        onClick={clearResult}
                        className="text-red-400 hover:text-red-600 text-lg leading-none"
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="flex flex-grow overflow-hidden">

                <ChatSection
                    messages={messages}
                    user={user}
                    message={message}
                    setMessage={setMessage}
                    send={send}
                    messageBox={messageBox}
                    isAiTyping={isAiTyping}
                    WriteAiMessage={WriteAiMessage}
                    setIsModalOpen={setIsModalOpen}
                    isSidePanelOpen={isSidePanelOpen}
                    setIsSidePanelOpen={setIsSidePanelOpen}
                >
                    <SidePanel
                        isOpen={isSidePanelOpen}
                        onClose={() => setIsSidePanelOpen(false)}
                        collaborators={project.users}
                    />
                </ChatSection>

                <section className="right bg-red-50 flex-grow h-full flex flex-col">

                    {/* Push to GitHub button — only show when fileTree has files */}
                    {Object.keys(fileTree).length > 0 && (
                        <div className="flex justify-end px-3 py-1.5 bg-slate-100 border-b border-slate-200 flex-shrink-0">
                            <button
                                onClick={() => { clearResult(); setIsGitHubModalOpen(true) }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md hover:bg-gray-700 transition-colors"
                            >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                                </svg>
                                Push to GitHub
                            </button>
                        </div>
                    )}

                    <div className="flex flex-grow overflow-hidden">
                        <FileExplorer
                            fileTree={fileTree}
                            currentFile={currentFile}
                            setCurrentFile={setCurrentFile}
                            openFiles={openFiles}
                            setOpenFiles={setOpenFiles}
                        />

                        <CodeEditor
                            fileTree={fileTree}
                            currentFile={currentFile}
                            setCurrentFile={setCurrentFile}
                            openFiles={openFiles}
                            saveFileTree={handleSaveFileTree}
                            sendMessage={sendMessage}
                            setFileTree={setFileTree}
                            runProcessRef={runProcessRef}
                            setIsRunning={setIsRunning}
                            isRunning={isRunning}
                            startCommand={startCommand}
                            terminalOutput={terminalOutput}
                            setTerminalOutput={setTerminalOutput}
                            terminalRef={terminalRef}
                            webContainerRef={webContainerRef}
                        />

                        <Preview
                            iframeUrl={iframeUrl}
                            setIframeUrl={setIframeUrl}
                        />
                    </div>

                </section>

            </div>

            <CollaboratorsModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedUserId(new Set()) }}
                users={users}
                selectedUserId={selectedUserId}
                handleUserClick={handleUserClick}
                addCollaborators={handleAddCollaborators}
            />

            <GitHubPushModal
                isOpen={isGitHubModalOpen}
                onClose={() => setIsGitHubModalOpen(false)}
                onPush={handleGitHubPush}
                loading={githubLoading}
            />

        </main>
    )
}

export default Project
