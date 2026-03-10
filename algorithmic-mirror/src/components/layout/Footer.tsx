export function Footer() {
  return (
    <footer className="text-center py-6 text-xs text-gray-600 border-t border-gray-800/50">
      <p>
        Tus datos nunca abandonan tu navegador. 100% local, 0% servidor.
      </p>
      <p className="mt-1 text-gray-700">
        Algorithmic Mirror — {new Date().getFullYear()}
      </p>
    </footer>
  );
}
