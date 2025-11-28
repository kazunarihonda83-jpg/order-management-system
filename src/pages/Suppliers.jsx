import { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2 } from 'lucide-react';
import api from '../utils/api';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', payment_terms: 30, notes: '' });

  useEffect(() => { fetchSuppliers(); }, []);

  const fetchSuppliers = async () => {
    const res = await api.get('/suppliers');
    setSuppliers(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier.id}`, formData);
        alert('仕入先を更新しました');
      } else {
        await api.post('/suppliers', formData);
        alert('仕入先を登録しました');
      }
      setShowModal(false);
      setEditingSupplier(null);
      setFormData({ name: '', phone: '', email: '', payment_terms: 30, notes: '' });
      fetchSuppliers();
    } catch (error) {
      alert(error.response?.data?.error || (editingSupplier ? '更新に失敗しました' : '登録に失敗しました'));
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      phone: supplier.phone || '',
      email: supplier.email || '',
      payment_terms: supplier.payment_terms || 30,
      notes: supplier.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('削除しますか？')) return;
    try {
      await api.delete(`/suppliers/${id}`);
      alert('削除しました');
      fetchSuppliers();
    } catch (error) {
      alert(error.response?.data?.error || '削除失敗');
    }
  };

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'20px'}}>
        <h1 style={{display:'flex',alignItems:'center',gap:'10px'}}><Package size={28}/> 仕入先管理</h1>
        <button onClick={()=>setShowModal(true)} style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 20px',
          background:'#1890ff',color:'white',border:'none',borderRadius:'4px',cursor:'pointer'}}>
          <Plus size={18}/> 新規登録
        </button>
      </div>
      <div style={{background:'white',padding:'20px',borderRadius:'8px'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{borderBottom:'2px solid #f0f0f0'}}>
            <th style={{padding:'12px',textAlign:'left'}}>仕入先名</th>
            <th style={{padding:'12px',textAlign:'left'}}>電話番号</th>
            <th style={{padding:'12px',textAlign:'left'}}>メール</th>
            <th style={{padding:'12px',textAlign:'center'}}>操作</th>
          </tr></thead>
          <tbody>
            {suppliers.map(s=>(
              <tr key={s.id} style={{borderBottom:'1px solid #f0f0f0'}}>
                <td style={{padding:'12px'}}>{s.name}</td>
                <td style={{padding:'12px'}}>{s.phone||'-'}</td>
                <td style={{padding:'12px'}}>{s.email||'-'}</td>
                <td style={{padding:'12px',textAlign:'center'}}>
                  <div style={{display:'flex',gap:'8px',justifyContent:'center'}}>
                    <button onClick={()=>handleEdit(s)} style={{padding:'6px 12px',background:'#fff',
                      border:'1px solid #1890ff',color:'#1890ff',borderRadius:'4px',cursor:'pointer'}}>
                      <Edit size={14}/> 編集
                    </button>
                    <button onClick={()=>handleDelete(s.id)} style={{padding:'6px 12px',background:'#fff',
                      border:'1px solid #ff4d4f',color:'#ff4d4f',borderRadius:'4px',cursor:'pointer'}}>
                      <Trash2 size={14}/> 削除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {suppliers.length===0&&<div style={{textAlign:'center',padding:'40px',color:'#999'}}>データがありません</div>}
      </div>
      {showModal&&(
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',
          display:'flex',justifyContent:'center',alignItems:'center',zIndex:1000}}>
          <div style={{background:'white',padding:'30px',borderRadius:'8px',width:'500px'}}>
            <h2 style={{marginBottom:'20px'}}>{editingSupplier ? '仕入先編集' : '新規仕入先登録'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{marginBottom:'15px'}}>
                <label style={{display:'block',marginBottom:'5px'}}>仕入先名 *</label>
                <input type="text" value={formData.name} onChange={(e)=>setFormData({...formData,name:e.target.value})}
                  required style={{width:'100%',padding:'8px',border:'1px solid #ddd',borderRadius:'4px'}}/>
              </div>
              <div style={{marginBottom:'15px'}}>
                <label style={{display:'block',marginBottom:'5px'}}>電話番号</label>
                <input type="tel" value={formData.phone} onChange={(e)=>setFormData({...formData,phone:e.target.value})}
                  style={{width:'100%',padding:'8px',border:'1px solid #ddd',borderRadius:'4px'}}/>
              </div>
              <div style={{marginBottom:'15px'}}>
                <label style={{display:'block',marginBottom:'5px'}}>メール</label>
                <input type="email" value={formData.email} onChange={(e)=>setFormData({...formData,email:e.target.value})}
                  style={{width:'100%',padding:'8px',border:'1px solid #ddd',borderRadius:'4px'}}/>
              </div>
              <div style={{display:'flex',gap:'10px',justifyContent:'flex-end'}}>
                <button type="button" onClick={()=>setShowModal(false)}
                  style={{padding:'10px 20px',background:'#fff',border:'1px solid #ddd',borderRadius:'4px',cursor:'pointer'}}>
                  キャンセル
                </button>
                <button type="submit" style={{padding:'10px 20px',background:'#1890ff',color:'white',
                  border:'none',borderRadius:'4px',cursor:'pointer'}}>{editingSupplier ? '更新' : '登録'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
