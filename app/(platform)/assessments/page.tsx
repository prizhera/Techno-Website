import { Sparkles, Upload } from "lucide-react";
import Link from "next/link";

import { QuestionCard } from "@/components/shared/question-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { questionBank } from "@/data/mock-data";

export default function AssessmentsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="text-sm font-medium text-slate-700">Assessment Setup</div>
          <CardTitle>Build the assessment structure</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Assessment Title</label>
            <Input placeholder="Midterm Exam 1" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Subject</label>
            <Select defaultValue="calculus-1">
              <option value="calculus-1">Calculus 1</option>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Class</label>
            <Select defaultValue="bsce-sc123">
              <option value="bsce-sc123">BSCE SC123</option>
              <option value="bsit-sc221">BSIT SC221</option>
              <option value="bsmath-sc102">BSMath SC102</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Question Structure</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {questionBank.map((question) => (
            <QuestionCard key={question.id} id={question.id} title={question.title} prompt={question.prompt} />
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button>Add Question</Button>
        <Button variant="outline">
          <Upload className="h-4 w-4" />
          Upload Exam Paper
        </Button>
        <Button variant="secondary">
          <Sparkles className="h-4 w-4" />
          AI Suggest Topics
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Topic Suggestion Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <p>Q1: Power Rule • Q2: Chain Rule • Q3: Product Rule • Q4: Integration</p>
          <p className="rounded-xl bg-sky-50 p-3 text-sky-800">
            Teacher can confirm, edit, or override topic mappings before finalizing the assessment structure.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">Confirm and Edit Topics</Button>
            <Link href="/question-analysis">
              <Button>Start Assessment Analysis</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="border-sky-100 bg-sky-50/40">
        <CardHeader>
          <CardTitle>Proceed to Question Analysis</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-700">
            Move from assessment setup into class-wide mistake tagging and remediation analysis.
          </p>
          <Link href="/question-analysis">
            <Button>Proceed to Question Analysis</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}