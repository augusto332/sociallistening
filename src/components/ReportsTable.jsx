import { useState, useRef, useEffect } from "react"
import ReactDOM from "react-dom"
import {
  Download,
  Trash2,
  Calendar,
  Hash,
  MessageSquare,
  FileText,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Clock,
} from "lucide-react"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

export default function ModernReportsTable({ reports = [], onDownload, onDelete, onView, onEdit, onDuplicate }) {
  const [hoveredRow, setHoveredRow] = useState(null)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [openUp, setOpenUp] = useState(false)
  const [dropdownRect, setDropdownRect] = useState(null)
  const dropdownRefs = useRef([])
  const dropdownMenuRef = useRef(null)

  const closeDropdown = () => {
    setOpenDropdown(null)
    setDropdownRect(null)
  }

  const toggleDropdown = (idx) => {
    if (openDropdown === idx) {
      closeDropdown()
      return
    }
    const ref = dropdownRefs.current[idx]
    if (ref) {
      const rect = ref.getBoundingClientRect()
      setDropdownRect(rect)
      const menuHeight = 200
      setOpenUp(rect.bottom + menuHeight > window.innerHeight)
    }
    setOpenDropdown(idx)
  }

  const getPlatformColor = (platform) => {
    const colors = {
      youtube: "bg-red-500/20 text-red-300 border border-red-500/30",
      reddit: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
      twitter: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    }
    return colors[platform?.toLowerCase()] || "bg-slate-500/20 text-slate-300 border border-slate-500/30"
  }

  const formatDateRange = (report) => {
    if (report.datePreset) {
      return `Últimos ${report.datePreset} días`
    }
    if (report.startDate && report.endDate) {
      return `${new Date(report.startDate).toLocaleDateString()} - ${new Date(report.endDate).toLocaleDateString()}`
    }
    return "Sin definir"
  }

  const getCommentsInfo = (report) => {
    if (report.includeComments !== undefined) {
      return report.includeComments ? "Incluidos" : "Excluidos"
    }

    const commentPlatforms = [
      report.includeYoutubeComments && "YouTube",
      report.includeRedditComments && "Reddit",
    ].filter(Boolean)

    if (report.platforms?.includes("twitter") && commentPlatforms.length === 0) {
      return "N/A"
    }

    return commentPlatforms.length ? `Incluidos (${commentPlatforms.join(", ")})` : "Excluidos"
  }

  const getKeywordsDisplay = (report) => {
    if (report.keyword) return report.keyword
    if (Array.isArray(report.keywords)) {
      if (report.keywords.length === 1) return report.keywords[0]
      return `${report.keywords[0]} +${report.keywords.length - 1} más`
    }
    return report.keywords || "Sin definir"
  }

  const getScheduleTimeDisplay = (scheduleTime) => {
    if (!scheduleTime) return "hora no definida"

    const hasTimezoneInfo = /[zZ]|[+-]\d\d:?\d\d$/.test(scheduleTime)
    const isoTimeString = `1970-01-01T${hasTimezoneInfo ? scheduleTime : `${scheduleTime}Z`}`
    const date = new Date(isoTimeString)

    if (Number.isNaN(date.getTime())) {
      return scheduleTime
    }

    const timeString = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
    const offsetMinutes = -date.getTimezoneOffset()
    const sign = offsetMinutes >= 0 ? "+" : "-"
    const absoluteMinutes = Math.abs(offsetMinutes)
    const hours = Math.floor(absoluteMinutes / 60)
    const minutes = absoluteMinutes % 60
    const offset = minutes ? `${hours}:${minutes.toString().padStart(2, "0")}` : `${hours}`

    return `${timeString} hs (GMT${sign}${offset})`
  }

  const getScheduleTooltip = (report) => {
    if (!report.isScheduled) {
      return "Sin programación activa"
    }

    const timeDisplay = getScheduleTimeDisplay(report.scheduleTime)

    if (report.schedule === "daily") {
      return `Envío diario a las ${timeDisplay}`
    }

    if (report.schedule === "weekly") {
      const dayNames = {
        1: "lunes",
        2: "martes",
        3: "miércoles",
        4: "jueves",
        5: "viernes",
        6: "sábado",
        7: "domingo",
      }

      const dayName = dayNames[report.scheduleDay] || "día sin definir"
      return `Envío semanal los ${dayName} a las ${timeDisplay}`
    }

    return "Programación sin detalles"
  }

  useEffect(() => {
    if (openDropdown !== null) {
      const handleMouseDown = (e) => {
        if (
          dropdownMenuRef.current &&
          !dropdownMenuRef.current.contains(e.target) &&
          dropdownRefs.current[openDropdown] &&
          !dropdownRefs.current[openDropdown].contains(e.target)
        ) {
          closeDropdown()
        }
      }

      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          closeDropdown()
        }
      }

      document.addEventListener("mousedown", handleMouseDown)
      document.addEventListener("keydown", handleKeyDown)

      return () => {
        document.removeEventListener("mousedown", handleMouseDown)
        document.removeEventListener("keydown", handleKeyDown)
      }
    }
  }, [openDropdown])

  if (reports.length === 0) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-300 mb-2">No hay reportes</h3>
        <p className="text-slate-500">Crea tu primer reporte para comenzar a analizar tus menciones</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl">
      <div className="overflow-x-auto overflow-y-visible">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50 bg-slate-800/50">
              <th className="text-left p-4 text-slate-300 font-medium">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Nombre
                </div>
              </th>
              <th className="text-left p-4 text-slate-300 font-medium">
                <div className="flex items-center gap-2">
                  Plataformas
                </div>
              </th>
              <th className="text-left p-4 text-slate-300 font-medium">
                <div className="flex items-center gap-2">
                  Palabras clave
                </div>
              </th>
              <th className="text-left p-4 text-slate-300 font-medium">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Período
                </div>
              </th>
              <th className="text-center p-4 text-slate-300 font-medium">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  Frecuencia
                </div>
              </th>
              <th className="text-left p-4 text-slate-300 font-medium">Comentarios</th>
              <th className="text-right p-4 text-slate-300 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report, idx) => (
              <tr
                key={idx}
                className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors group"
                onMouseEnter={() => setHoveredRow(idx)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="font-medium text-white max-w-[200px] truncate">
                            {report.name}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{report.name}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div className="text-xs text-slate-500">Creado {new Date().toLocaleDateString()}</div>
                  </div>
                </td>

                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {(report.platforms || [report.platform].filter(Boolean)).map((platform) => (
                      <span
                        key={platform}
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getPlatformColor(
                          platform,
                        )}`}
                      >
                        {platform?.charAt(0).toUpperCase() + platform?.slice(1)}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="p-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border border-slate-600/50 text-slate-300 bg-slate-700/30">
                    {getKeywordsDisplay(report)}
                  </span>
                </td>

                <td className="p-4">
                  <div className="text-sm text-slate-300">{formatDateRange(report)}</div>
                </td>

                <td className="p-4">
                  <div className="flex justify-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className={`text-xl ${
                              report.isScheduled ? "text-emerald-400" : "text-slate-500"
                            }`}
                            role="img"
                            aria-label={report.isScheduled ? "Programación activa" : "Sin programación"}
                          >
                            {report.isScheduled ? "✅" : "❌"}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>{getScheduleTooltip(report)}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </td>

                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                      getCommentsInfo(report).includes("Incluidos")
                        ? "bg-green-500/20 text-green-300 border border-green-500/30"
                        : "bg-slate-500/20 text-slate-300 border border-slate-500/30"
                    }`}
                  >
                    {getCommentsInfo(report)}
                  </span>
                </td>

                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onDownload && onDownload(report)}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-gradient-to-r from-blue-500/20 to-purple-600/20 hover:from-blue-500/30 hover:to-purple-600/30 border border-blue-500/30 text-blue-300 hover:text-white transition-all duration-200"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Descargar
                    </button>

                    <div className="relative" ref={(el) => (dropdownRefs.current[idx] = el)}>
                      <button
                        onClick={() => toggleDropdown(idx)}
                        className="inline-flex items-center p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {openDropdown === idx &&
                        dropdownRect &&
                        ReactDOM.createPortal(
                          <div
                            className="fixed z-50"
                            style={{
                              top: dropdownRect.top,
                              left: dropdownRect.left,
                              width: dropdownRect.width,
                              height: dropdownRect.height,
                            }}
                          >
                            <div
                              ref={dropdownMenuRef}
                              className={`absolute right-0 w-48 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-lg shadow-xl ${
                                openUp ? "bottom-full mb-2" : "top-full mt-2"
                              }`}
                            >
                              {onView && (
                                <button
                                  onClick={() => {
                                    onView(report, idx)
                                    closeDropdown()
                                  }}
                                  className="flex items-center w-full px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver detalles
                                </button>
                              )}
                              {onEdit && (
                                <button
                                  onClick={() => {
                                    onEdit(report, idx)
                                    closeDropdown()
                                  }}
                                  className="flex items-center w-full px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar
                                </button>
                              )}
                              {onDuplicate && (
                                <button
                                  onClick={() => {
                                    onDuplicate(report, idx)
                                    closeDropdown()
                                  }}
                                  className="flex items-center w-full px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                                >
                                  <Copy className="w-4 h-4 mr-2" />
                                  Duplicar
                                </button>
                              )}
                              <div className="border-t border-slate-700/50 my-1"></div>
                              <button
                                onClick={() => {
                                  onDelete && onDelete(idx)
                                  closeDropdown()
                                }}
                                className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                              </button>
                            </div>
                          </div>,
                          document.body,
                        )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
