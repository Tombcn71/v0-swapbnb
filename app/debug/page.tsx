import { executeQuery } from "@/lib/db"

export default async function DebugPage() {
  let users = []
  let messages = []
  let error = null

  try {
    const usersResult = await executeQuery("SELECT id, name, email FROM users LIMIT 10")
    users = usersResult

    const messagesResult = await executeQuery(
      "SELECT id, sender_id, receiver_id, content, created_at FROM messages LIMIT 10",
    )
    messages = messagesResult
  } catch (err) {
    error = err
    console.error("Debug page error:", err)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Database Debug</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error:</p>
          <pre className="mt-2 whitespace-pre-wrap">{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Database Connection</h2>
        <p className="mb-2">Status: {error ? "❌ Error" : "✅ Connected"}</p>
        <p className="text-sm text-gray-600">Connection string: {process.env.DATABASE_URL ? "✅ Set" : "❌ Missing"}</p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Users ({users.length})</h2>
        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="border px-4 py-2">ID</th>
                  <th className="border px-4 py-2">Name</th>
                  <th className="border px-4 py-2">Email</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user.id}>
                    <td className="border px-4 py-2">{user.id}</td>
                    <td className="border px-4 py-2">{user.name}</td>
                    <td className="border px-4 py-2">{user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-red-500">No users found</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Messages ({messages.length})</h2>
        {messages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="border px-4 py-2">ID</th>
                  <th className="border px-4 py-2">Sender ID</th>
                  <th className="border px-4 py-2">Receiver ID</th>
                  <th className="border px-4 py-2">Content</th>
                  <th className="border px-4 py-2">Created At</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message: any) => (
                  <tr key={message.id}>
                    <td className="border px-4 py-2">{message.id}</td>
                    <td className="border px-4 py-2">{message.sender_id}</td>
                    <td className="border px-4 py-2">{message.receiver_id}</td>
                    <td className="border px-4 py-2">{message.content}</td>
                    <td className="border px-4 py-2">{new Date(message.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-red-500">No messages found</p>
        )}
      </div>
    </div>
  )
}
