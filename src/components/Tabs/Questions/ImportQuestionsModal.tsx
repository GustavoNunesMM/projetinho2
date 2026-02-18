import { useState } from "react";
import {
  X,
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  Loader,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Chip } from "@heroui/react";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Question, QuestionFormData } from "@/types/question";
import { Toast } from "@/components/common/Toast";
import Button from "@/components/common/Button";
import Portal from "@/components/common/Portal";

interface ImportQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (question: QuestionFormData) => Promise<void>;
}

interface SearchFilters {
  content: string;
  hasImage: "all" | "with" | "without";
  type: "all" | "multipla" | "aberta";
  category: string;
  difficulty: "all" | "facil" | "media" | "dificil";
}

export default function ImportQuestionsModal({
  isOpen,
  onClose,
  onImport,
}: ImportQuestionsModalProps) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [importingId, setImportingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  const [filters, setFilters] = useState<SearchFilters>({
    content: "",
    hasImage: "all",
    type: "all",
    category: "",
    difficulty: "all",
  });

  const handleSearch = async (page: number = 1) => {
    if (!user?.id) {
      Toast({ message: "Usuário não autenticado", color: "danger" });

      return;
    }

    setSearching(true);
    setLoading(true);
    setCurrentPage(page);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Erro ao obter sessão:", sessionError);
        Toast({
          message: "Erro de autenticação. Faça login novamente.",
          color: "danger",
        });

        return;
      }

      if (!session) {
        Toast({
          message: "Sessão expirada. Faça login novamente.",
          color: "danger",
        });

        return;
      }

      console.log("Sessão ativa:", {
        userId: session.user.id,
        userEmail: session.user.email,
        expectedUserId: user.id,
      });

      let query = supabase
        .from("questions")
        .select("*")
        .neq("user_id", user.id);

      if (filters.content.trim()) {
        const searchTerm = `%${filters.content}%`;

        query = query.or(
          `title.ilike.${searchTerm},content.ilike.${searchTerm}`,
        );
      }

      if (filters.type !== "all") {
        query = query.eq("type", filters.type);
      }

      if (filters.category.trim()) {
        query = query.eq("category", filters.category);
      }

      if (filters.difficulty !== "all") {
        query = query.eq("difficulty", filters.difficulty);
      }

      const offset = (page - 1) * itemsPerPage;

      const { data, error, count } = await query
        .select("*")
        .range(offset, offset + itemsPerPage - 1);

      setTotalCount(count || 0);

      if (error) {
        console.error("Supabase error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });

        if (
          error.code === "PGRST301" ||
          error.message?.includes("permission")
        ) {
          Toast({
            message:
              "Erro de permissão: Verifique as políticas RLS no Supabase",
            color: "danger",
          });
        }

        throw error;
      }

      if (!data) {
        console.warn("Data is null or undefined");
        setQuestions([]);

        return;
      }

      const convertedQuestions: Question[] = (data || []).map((q: any) => ({
        id: q.id,
        title: q.title,
        content: q.content,
        contentImage: q.content_image,
        difficulty: q.difficulty,
        subject: q.subject,
        category: q.category,
        type: q.type,
        options:
          typeof q.options === "string"
            ? JSON.parse(q.options)
            : q.options || [],
        optionImages:
          typeof q.option_images === "string"
            ? JSON.parse(q.option_images || "[]")
            : q.option_images || [],
        correctAnswer: q.correct_answer,
        explanation: q.explanation,
        importedFrom: q.imported_from,
        created_at: q.created_at,
      }));

      let filtered = convertedQuestions;

      if (filters.hasImage === "with") {
        filtered = filtered.filter(
          (q) => q.contentImage && q.contentImage.trim() !== "",
        );
      } else if (filters.hasImage === "without") {
        filtered = filtered.filter(
          (q) => !q.contentImage || q.contentImage.trim() === "",
        );
      }

      console.log("Filtered questions:", filtered.length);
      setQuestions(filtered);
    } catch (error: any) {
      console.error("Erro ao buscar questões:", error);
      Toast({
        message: `Erro ao buscar questões: ${error.message}`,
        color: "danger",
      });
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const handleImport = async (question: Question) => {
    setImportingId(question.id);
    try {
      const questionData: QuestionFormData = {
        title: question.title,
        content: question.content,
        contentImage: question.contentImage,
        difficulty: question.difficulty,
        subject: question.subject,
        category: question.category,
        type: question.type,
        options: question.options,
        optionImages: question.optionImages,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        importedFrom: `Usuário: ${question.id}`,
      };

      await onImport(questionData);
      Toast({ message: "Questão importada com sucesso!" });
    } catch (error: any) {
      Toast({
        message: `Erro ao importar: ${error.message}`,
        color: "danger",
      });
    } finally {
      setImportingId(null);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, "success" | "warning" | "danger"> = {
      facil: "success",
      media: "warning",
      dificil: "danger",
    };

    return colors[difficulty] || "default";
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-gray-100 animate-scaleIn">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
                📥 Importar Questões
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Busque e importe questões de outros usuários
              </p>
            </div>
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar conteúdo
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Título ou conteúdo..."
                  type="text"
                  value={filters.content}
                  onChange={(e) =>
                    setFilters({ ...filters, content: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={filters.type}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      type: e.target.value as any,
                    })
                  }
                >
                  <option value="all">Todos</option>
                  <option value="multipla">Múltipla Escolha</option>
                  <option value="aberta">Aberta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dificuldade
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={filters.difficulty}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      difficulty: e.target.value as any,
                    })
                  }
                >
                  <option value="all">Todas</option>
                  <option value="facil">Fácil</option>
                  <option value="media">Média</option>
                  <option value="dificil">Difícil</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ex: Matemática..."
                  type="text"
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagem
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={filters.hasImage}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      hasImage: e.target.value as any,
                    })
                  }
                >
                  <option value="all">Todas</option>
                  <option value="with">Com imagem</option>
                  <option value="without">Sem imagem</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
                  disabled={searching}
                  icon={searching ? Loader : Search}
                  variant="custom"
                  onClick={() => handleSearch(1)}
                >
                  {searching ? "Buscando..." : "Pesquisar"}
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[50vh]">
            {loading ? (
              <div className="text-center py-12">
                <Loader className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Buscando questões...</p>
              </div>
            ) : !searching && questions.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {searching
                    ? "Buscando questões..."
                    : "Nenhuma busca realizada. Use os filtros acima e clique em 'Pesquisar'."}
                </p>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <p className="text-gray-500">
                  Nenhuma questão encontrada com os filtros selecionados.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {questions.map((question) => (
                    <div
                      key={question.id}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-800">
                              {question.title}
                            </h3>
                            <Chip
                              color={getDifficultyColor(question.difficulty)}
                              size="sm"
                              variant="flat"
                            >
                              {question.difficulty}
                            </Chip>
                            <Chip color="secondary" size="sm" variant="flat">
                              {question.type === "multipla"
                                ? "Múltipla Escolha"
                                : "Aberta"}
                            </Chip>
                            {question.contentImage && (
                              <Chip color="primary" size="sm" variant="flat">
                                📷 Com imagem
                              </Chip>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {question.content}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Categoria: {question.category}</span>
                            <span>Matéria: {question.subject}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            className="px-3 py-1.5 text-sm"
                            icon={
                              expandedId === question.id
                                ? ChevronUp
                                : ChevronDown
                            }
                            variant="custom"
                            onClick={() => toggleExpand(question.id)}
                          >
                            {expandedId === question.id
                              ? "Recolher"
                              : "Expandir"}
                          </Button>
                          <Button
                            className="px-3 py-1.5 text-sm bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white"
                            disabled={importingId === question.id}
                            icon={
                              importingId === question.id ? Loader : Download
                            }
                            variant="custom"
                            onClick={() => handleImport(question)}
                          >
                            {importingId === question.id
                              ? "Importando..."
                              : "Importar"}
                          </Button>
                        </div>
                      </div>

                      {expandedId === question.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">
                              Enunciado:
                            </h4>
                            <p className="text-gray-800 whitespace-pre-wrap">
                              {question.content}
                            </p>
                            {question.contentImage && (
                              <div className="mt-2">
                                <img
                                  alt="Questão"
                                  className="max-w-full h-auto rounded-lg border border-gray-200"
                                  src={question.contentImage}
                                />
                              </div>
                            )}
                          </div>

                          {question.type === "multipla" &&
                            question.options.length > 0 && (
                              <div>
                                <h4 className="font-medium text-gray-700 mb-2">
                                  Alternativas:
                                </h4>
                                <div className="space-y-2">
                                  {question.options.map((option, idx) => (
                                    <div
                                      key={idx}
                                      className={`p-2 rounded-lg border ${
                                        option === question.correctAnswer
                                          ? "bg-green-50 border-green-200"
                                          : "bg-gray-50 border-gray-200"
                                      }`}
                                    >
                                      <div className="flex items-start gap-2">
                                        <span className="font-medium text-gray-600">
                                          {String.fromCharCode(65 + idx)}:
                                        </span>
                                        <span className="flex-1">{option}</span>
                                        {option === question.correctAnswer && (
                                          <Chip
                                            color="success"
                                            size="sm"
                                            variant="flat"
                                          >
                                            Correta
                                          </Chip>
                                        )}
                                      </div>
                                      {question.optionImages[idx] && (
                                        <img
                                          alt={`Alternativa ${String.fromCharCode(65 + idx)}`}
                                          className="mt-2 max-w-xs h-auto rounded border border-gray-200"
                                          src={question.optionImages[idx]!}
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          {question.explanation && (
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">
                                Explicação:
                              </h4>
                              <p className="text-gray-800 whitespace-pre-wrap">
                                {question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {totalCount > itemsPerPage && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Mostrando{" "}
                      {Math.min(
                        (currentPage - 1) * itemsPerPage + 1,
                        totalCount,
                      )}{" "}
                      - {Math.min(currentPage * itemsPerPage, totalCount)} de{" "}
                      {totalCount} questões
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={currentPage === 1 || loading}
                        icon={ChevronLeft}
                        variant="custom"
                        onClick={() => handleSearch(currentPage - 1)}
                      >
                        Anterior
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.ceil(totalCount / itemsPerPage) },
                          (_, i) => i + 1,
                        )
                          .filter((pageNum) => {
                            const totalPages = Math.ceil(
                              totalCount / itemsPerPage,
                            );

                            return (
                              pageNum === 1 ||
                              pageNum === totalPages ||
                              (pageNum >= currentPage - 1 &&
                                pageNum <= currentPage + 1)
                            );
                          })
                          .map((pageNum, idx, arr) => {
                            const showEllipsis =
                              idx > 0 && pageNum - arr[idx - 1] > 1;

                            return (
                              <div
                                key={pageNum}
                                className="flex items-center gap-1"
                              >
                                {showEllipsis && (
                                  <span className="px-2 text-gray-400">
                                    ...
                                  </span>
                                )}
                                <button
                                  className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                                    currentPage === pageNum
                                      ? "bg-primary-600 text-white font-semibold"
                                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                                  disabled={loading}
                                  onClick={() => handleSearch(pageNum)}
                                >
                                  {pageNum}
                                </button>
                              </div>
                            );
                          })}
                      </div>

                      <Button
                        className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={
                          currentPage >= Math.ceil(totalCount / itemsPerPage) ||
                          loading
                        }
                        icon={ChevronRight}
                        variant="custom"
                        onClick={() => handleSearch(currentPage + 1)}
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
            <Button
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl transition-all duration-300 font-medium"
              variant="custom"
              onClick={onClose}
            >
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}