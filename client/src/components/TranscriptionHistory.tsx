import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Eye, Copy, Download, Trash2, AlertTriangle, Clock, FileText, Play, Pause, Volume2, Filter, CheckSquare, Square, DownloadCloud, Search, Languages, Calendar, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TranscriptionResult } from "./AudioUploader";

interface TranscriptionHistoryProps {
  currentResult: TranscriptionResult | null;
}

interface FilterOptions {
  language: string;
  dateRange: string;
  customStartDate: string;
  customEndDate: string;
  searchQuery: string;
}

export const TranscriptionHistory = ({ currentResult }: TranscriptionHistoryProps) => {
  const [history, setHistory] = useState<TranscriptionResult[]>([]);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    language: 'all',
    dateRange: 'all',
    customStartDate: '',
    customEndDate: '',
    searchQuery: ''
  });
  const { toast } = useToast();

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('transcription-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        const historyWithDates = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setHistory(historyWithDates);
      } catch (error) {
        console.error('Error loading history:', error);
      }
    }
  }, []);

  // Save current result to history
  useEffect(() => {
    if (currentResult) {
      setHistory(prev => {
        const newHistory = [currentResult, ...prev.filter(item => item.id !== currentResult.id)];
        const limitedHistory = newHistory.slice(0, 100); // Keep only last 100 items
        localStorage.setItem('transcription-history', JSON.stringify(limitedHistory));
        return limitedHistory;
      });
    }
  }, [currentResult]);

  // Filtered history based on current filters
  const filteredHistory = useMemo(() => {
    let filtered = [...history];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.text.toLowerCase().includes(query) ||
        item.fileName.toLowerCase().includes(query)
      );
    }

    // Language filter
    if (filters.language !== 'all') {
      filtered = filtered.filter(item => item.language === filters.language);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (filters.dateRange) {
        case 'today':
          filtered = filtered.filter(item => item.timestamp >= startOfToday);
          break;
        case 'yesterday':
          const yesterday = new Date(startOfToday);
          yesterday.setDate(yesterday.getDate() - 1);
          filtered = filtered.filter(item => 
            item.timestamp >= yesterday && item.timestamp < startOfToday
          );
          break;
        case 'week':
          const weekAgo = new Date(startOfToday);
          weekAgo.setDate(weekAgo.getDate() - 7);
          filtered = filtered.filter(item => item.timestamp >= weekAgo);
          break;
        case 'month':
          const monthAgo = new Date(startOfToday);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          filtered = filtered.filter(item => item.timestamp >= monthAgo);
          break;
        case 'custom':
          if (filters.customStartDate) {
            const startDate = new Date(filters.customStartDate);
            filtered = filtered.filter(item => item.timestamp >= startDate);
          }
          if (filters.customEndDate) {
            const endDate = new Date(filters.customEndDate);
            endDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(item => item.timestamp <= endDate);
          }
          break;
      }
    }

    return filtered;
  }, [history, filters]);

  // Get unique languages from history
  const availableLanguages = useMemo(() => {
    const languages = new Set(history.map(item => item.language));
    return Array.from(languages).sort();
  }, [history]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied! 📋",
        description: "Text copied to clipboard successfully",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy text to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadAsText = (result: TranscriptionResult) => {
    const content = `Audio File: ${result.fileName}
Language: ${result.language}
Timestamp: ${result.timestamp.toLocaleString()}
Duration: ${result.duration ? Math.round(result.duration) + 's' : 'Unknown'}

Transcription:
${result.text}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription-${result.fileName.replace(/\.[^/.]+$/, "")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Complete",
      description: "Transcription file downloaded successfully",
    });
  };

  const downloadSelected = () => {
    const selectedResults = filteredHistory.filter(item => selectedItems.has(item.id));
    if (selectedResults.length === 0) return;

    const content = selectedResults.map(result => `
========================================
Audio File: ${result.fileName}
Language: ${result.language}
Timestamp: ${result.timestamp.toLocaleString()}
Duration: ${result.duration ? Math.round(result.duration) + 's' : 'Unknown'}

Transcription:
${result.text}
========================================
`).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcriptions-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Complete",
      description: `${selectedResults.length} transcriptions downloaded`,
    });
  };

  const deleteSelected = () => {
    const newHistory = history.filter(item => !selectedItems.has(item.id));
    setHistory(newHistory);
    localStorage.setItem('transcription-history', JSON.stringify(newHistory));
    setSelectedItems(new Set());
    
    toast({
      title: "Items Deleted",
      description: `${selectedItems.size} transcriptions deleted`,
    });
  };

  const deleteItem = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('transcription-history', JSON.stringify(newHistory));
    
    toast({
      title: "Item Deleted",
      description: "Transcription deleted successfully",
    });
  };

  const clearAllHistory = () => {
    setHistory([]);
    setSelectedItems(new Set());
    localStorage.removeItem('transcription-history');
    
    toast({
      title: "History Cleared",
      description: "All transcriptions have been deleted",
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredHistory.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredHistory.map(item => item.id)));
    }
  };

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const playAudio = (audioUrl: string, itemId: string) => {
    if (playingAudio === itemId) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(itemId);
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => setPlayingAudio(null);
    }
  };

  const resetFilters = () => {
    setFilters({
      language: 'all',
      dateRange: 'all',
      customStartDate: '',
      customEndDate: '',
      searchQuery: ''
    });
  };

  const hasActiveFilters = filters.language !== 'all' || filters.dateRange !== 'all' || filters.searchQuery;

  return (
    <Card className="w-full shadow-xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-slate-600 to-slate-800 rounded-lg shadow-md">
              <History className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Transcription History</CardTitle>
              <CardDescription className="text-base">
                {filteredHistory.length} of {history.length} transcriptions
                {hasActiveFilters && " (filtered)"}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`${showFilters ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' : ''}`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">!</Badge>}
            </Button>
            {filteredHistory.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
                className="flex items-center gap-2"
              >
                {selectedItems.size === filteredHistory.length ? 
                  <CheckSquare className="h-4 w-4" /> : 
                  <Square className="h-4 w-4" />
                }
                {selectedItems.size === filteredHistory.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </Label>
                <Input
                  id="search"
                  placeholder="Search transcriptions..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="h-9"
                />
              </div>

              {/* Language Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Language
                </Label>
                <Select 
                  value={filters.language} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    {availableLanguages.map(lang => (
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date Range
                </Label>
                <Select 
                  value={filters.dateRange} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Date Range */}
              {filters.dateRange === 'custom' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Custom Range</Label>
                  <div className="space-y-1">
                    <Input
                      type="date"
                      value={filters.customStartDate}
                      onChange={(e) => setFilters(prev => ({ ...prev, customStartDate: e.target.value }))}
                      className="h-9 text-xs"
                    />
                    <Input
                      type="date"
                      value={filters.customEndDate}
                      onChange={(e) => setFilters(prev => ({ ...prev, customEndDate: e.target.value }))}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {filteredHistory.length} of {history.length} transcriptions
              </div>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedItems.size > 0 && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {selectedItems.size} items selected
            </span>
            <Separator orientation="vertical" className="h-4" />
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadSelected}
              className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
            >
              <DownloadCloud className="h-4 w-4 mr-1" />
              Download Selected
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteSelected}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Selected
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            {history.length === 0 ? (
              <div className="space-y-3">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-slate-400 to-slate-600 rounded-full flex items-center justify-center">
                  <History className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-muted-foreground">No Transcriptions Yet</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Your transcription history will appear here after you upload and process audio files.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                  <Filter className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-muted-foreground">No Results Found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  No transcriptions match your current filters. Try adjusting your search criteria.
                </p>
                <Button variant="outline" onClick={resetFilters}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {filteredHistory.map((result) => (
                <div
                  key={result.id}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedItems.has(result.id)
                      ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedItems.has(result.id)}
                      onCheckedChange={() => toggleSelectItem(result.id)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm truncate">{result.fileName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {result.language}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {result.timestamp.toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {result.text}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {result.audioUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => playAudio(result.audioUrl!, result.id)}
                              className="h-8 px-2"
                            >
                              {playingAudio === result.id ? (
                                <Pause className="h-3 w-3" />
                              ) : (
                                <Play className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 px-2">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <FileText className="h-5 w-5" />
                                  {result.fileName}
                                </DialogTitle>
                                <DialogDescription>
                                  Language: {result.language} • Date: {result.timestamp.toLocaleString()}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Textarea
                                  value={result.text}
                                  readOnly
                                  className="min-h-[200px] resize-none"
                                />
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => copyToClipboard(result.text)}
                                  >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Text
                                  </Button>
                                  <Button onClick={() => downloadAsText(result)}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(result.text)}
                            className="h-8 px-2"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadAsText(result)}
                            className="h-8 px-2"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteItem(result.id)}
                            className="h-8 px-2 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {history.length > 0 && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Total: {history.length} transcriptions
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllHistory}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All History
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};