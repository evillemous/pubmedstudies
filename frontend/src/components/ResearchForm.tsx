import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { FileText, BookOpen, Users, Calendar, Target, FlaskConical } from 'lucide-react';

interface ResearchFormProps {
  onSubmit: (formData: ResearchFormData) => void;
  isLoading: boolean;
}

export interface ResearchFormData {
  researchIdea: string;
  studyType: string;
  population: string;
  startYear: string;
  endYear: string;
  outcomes: string;
  targetJournal: string;
}

export function ResearchForm({ onSubmit, isLoading }: ResearchFormProps) {
  const [formData, setFormData] = useState<ResearchFormData>({
    researchIdea: '',
    studyType: '',
    population: '',
    startYear: '',
    endYear: '',
    outcomes: '',
    targetJournal: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Medical Research Manuscript Generator</CardTitle>
        <CardDescription>
          Enter your research idea and optional parameters to generate a publication-ready manuscript
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="researchIdea" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Research Idea
              </Label>
              <Textarea
                id="researchIdea"
                name="researchIdea"
                placeholder="e.g., Do a meta-analysis on antibiotic use after tonsillectomy in children"
                className="min-h-24"
                value={formData.researchIdea}
                onChange={handleChange}
                required
              />
            </div>

            <Separator className="my-4" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="studyType" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Study Type
                </Label>
                <Select
                  value={formData.studyType}
                  onValueChange={(value) => handleSelectChange('studyType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select study type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meta-analysis">Meta-analysis</SelectItem>
                    <SelectItem value="systematic-review">Systematic Review</SelectItem>
                    <SelectItem value="scoping-review">Scoping Review</SelectItem>
                    <SelectItem value="narrative-review">Narrative Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="population" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Population
                </Label>
                <Select
                  value={formData.population}
                  onValueChange={(value) => handleSelectChange('population', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select population" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pediatric">Pediatric</SelectItem>
                    <SelectItem value="adult">Adult</SelectItem>
                    <SelectItem value="elderly">Elderly</SelectItem>
                    <SelectItem value="all">All Ages</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date Range
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    name="startYear"
                    placeholder="Start Year"
                    min="1900"
                    max="2025"
                    value={formData.startYear}
                    onChange={handleChange}
                  />
                  <Input
                    type="number"
                    name="endYear"
                    placeholder="End Year"
                    min="1900"
                    max="2025"
                    value={formData.endYear}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="outcomes" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Outcomes of Interest
                </Label>
                <Input
                  id="outcomes"
                  name="outcomes"
                  placeholder="e.g., infection rate, hospital stay, recurrence"
                  value={formData.outcomes}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetJournal" className="flex items-center gap-2">
                  <FlaskConical className="h-4 w-4" />
                  Target Journal
                </Label>
                <Select
                  value={formData.targetJournal}
                  onValueChange={(value) => handleSelectChange('targetJournal', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select target journal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JAMA">JAMA</SelectItem>
                    <SelectItem value="NEJM">New England Journal of Medicine</SelectItem>
                    <SelectItem value="The Laryngoscope">The Laryngoscope</SelectItem>
                    <SelectItem value="BMJ">British Medical Journal</SelectItem>
                    <SelectItem value="Lancet">The Lancet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <CardFooter className="flex justify-end pt-6 px-0">
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? 'Generating...' : 'Generate Manuscript'}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
