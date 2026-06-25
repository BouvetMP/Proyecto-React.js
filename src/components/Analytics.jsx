import { useMemo } from 'react';
import { useTransactions, useBank } from '../store/Context';
import '../styles/Analytics.css';

const fmtCOP = n => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0}).format(n);

export default function Analytics() {
  const { transactions } = useTransactions();
  const { selectedBank } = useBank();

  const filtered = useMemo(() => selectedBank==='all'?transactions:transactions.filter(t=>t.bank.id===selectedBank),[transactions,selectedBank]);

  const an = useMemo(()=>{
    const byType={},byCity={},byChannel={},byBank={};
    let totalFraud=0;
    filtered.forEach(t=>{
      if(!byType[t.type])byType[t.type]={count:0,amount:0,fraud:0};
      byType[t.type].count++;byType[t.type].amount+=t.amount;
      if(t.isFraud){byType[t.type].fraud++;totalFraud++;}
      byCity[t.location.city]=(byCity[t.location.city]||0)+1;
      byChannel[t.channel]=(byChannel[t.channel]||0)+1;
      if(!byBank[t.bank.name])byBank[t.bank.name]={count:0,fraud:0,color:t.bank.color};
      byBank[t.bank.name].count++;
      if(t.isFraud)byBank[t.bank.name].fraud++;
    });
    const avg=filtered.length>0?Math.round(filtered.reduce((s,t)=>s+t.amount,0)/filtered.length):0;
    const fp=filtered.length>0?((totalFraud/filtered.length)*100).toFixed(1):0;
    return{byType,byCity,byChannel,byBank,avg,fp,totalFraud};
  },[filtered]);

  const st=Object.entries(an.byType).sort((a,b)=>b[1].count-a[1].count);
  const sc=Object.entries(an.byCity).sort((a,b)=>b[1]-a[1]).slice(0,12);
  const sb=Object.entries(an.byBank).sort((a,b)=>b[1].count-a[1].count);
  const mxT=Math.max(...st.map(([,v])=>v.count),1);
  const mxC=Math.max(...sc.map(([,v])=>v),1);
  const mxB=Math.max(...sb.map(([,v])=>v.count),1);
  const mxCn=Math.max(...Object.values(an.byChannel),1);
  const chIcons={mobile:'📱',web:'💻',pos:'💳'};

  return (
    <div className="an-page">
      <div className="an-h"><div><h2>Analíticas del Modelo</h2><p>Métricas de efectividad y rendimiento del modelo ML</p></div></div>

      <div className="an-m">
        <div className="mc"><div className="mr"><svg viewBox="0 0 36 36"><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--bg-primary)" strokeWidth="3"/><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#34D399" strokeWidth="3" strokeDasharray="94.2, 100" strokeLinecap="round"/><text x="18" y="20.35" textAnchor="middle" fill="var(--text-primary)" fontSize="8" fontWeight="700">94.2%</text></svg></div><div className="mi"><span className="mv">94.2%</span><span className="ml">Tasa de Detección</span></div></div>
        <div className="mc"><div className="mr"><svg viewBox="0 0 36 36"><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--bg-primary)" strokeWidth="3"/><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#FBBF24" strokeWidth="3" strokeDasharray="3.8, 100" strokeLinecap="round"/><text x="18" y="20.35" textAnchor="middle" fill="var(--text-primary)" fontSize="8" fontWeight="700">3.8%</text></svg></div><div className="mi"><span className="mv">3.8%</span><span className="ml">Falsos Positivos</span></div></div>
        <div className="mc"><div className="mi"><span className="mv">{fmtCOP(an.avg)}</span><span className="ml">Monto Promedio</span></div></div>
        <div className="mc"><div className="mi"><span className="mv">{filtered.length.toLocaleString()}</span><span className="ml">Total Analizadas</span></div></div>
      </div>

      <div className="an-g">
        <div className="ac"><h3>Transacciones por Tipo</h3><div className="ab">{st.map(([t,d])=><div key={t} className="abr"><span className="bln">{t}</span><div className="rbt"><div className="rbf" style={{width:`${(d.count/mxT)*100}%`}}></div></div><span className="blc">{d.count}</span><span className="ab-f" style={{color:d.fraud>0?'#EF4444':'#34D399'}}>{d.fraud}</span></div>)}</div></div>
        <div className="ac"><h3>Top Ciudades</h3><div className="ab">{sc.map(([c,cnt])=><div key={c} className="abr"><span className="bln">{c}</span><div className="rbt"><div className="rbf rf-alt" style={{width:`${(cnt/mxC)*100}%`}}></div></div><span className="blc">{cnt}</span></div>)}</div></div>
        <div className="ac"><h3>Canal</h3><div className="ab">{Object.entries(an.byChannel).map(([ch,cnt])=><div key={ch} className="abr"><span className="bln">{chIcons[ch]||'📊'} {ch}</span><div className="rbt"><div className="rbf rf-ch" style={{width:`${(cnt/mxCn)*100}%`}}></div></div><span className="blc">{cnt}</span></div>)}</div></div>
        <div className="ac"><h3>Fraude por Banco</h3><div className="ab">{sb.map(([b,d])=><div key={b} className="abr"><span className="bln">{b}</span><div className="rbt"><div className="rbf" style={{width:`${(d.count/mxB)*100}%`,background:d.color}}></div></div><span className="blc">{d.count}</span><span className="ab-f" style={{color:d.fraud>0?'#EF4444':'#34D399'}}>{d.fraud}</span></div>)}</div></div>
      </div>
    </div>
  );
}
