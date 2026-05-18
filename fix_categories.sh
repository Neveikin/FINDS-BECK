#!/bin/bash

sed -i "s/'АКССЕСУАРЫ'/'АКСЕССУАРЫ'/g" /opt/finds-beck/frontend/src/pages/categories/ui/CategoryPage.tsx

sed -i '292,296d' /opt/finds-beck/frontend/src/pages/admin/ui/AdminPanel.tsx                                                                                                             
  sed -i '291a\                      <select value={productFormData.category} onChange={e => setProductFormData({...productFormData, category: e.target.value})} required>\                
                          <option value="">Выберите категорию</option>\                                                                                                                    
                          <option value="ФУТБОЛКИ">Футболки</option>\                                                                                                                      
                          <option value="ЗИПКИ">Зипки</option>\                                                                                                                            
                          <option value="СВИТЕРЫ">Свитеры</option>\                                                                                                                        
                          <option value="ШТАНЫ">Штаны</option>\                                                                                                                            
                          <option value="КУРТКИ">Куртки</option>\                                                                                                                          
                          <option value="АКСЕССУАРЫ">Аксессуары</option>\                                                                                                                  
                        </select>' /opt/finds-beck/frontend/src/pages/admin/ui/AdminPanel.tsx  


sed -i '227,231d' /opt/finds-beck/frontend/src/pages/store-dashboard/ui/StoreDashboard.tsx                                                                                               
  sed -i '226a\                          <select value={productFormData.categoryName} onChange={e => setProductFormData({...productFormData, categoryName: e.target.value})}>\             
                              <option value="ФУТБОЛКИ">Футболки</option>\                                                                                                                  
                              <option value="ЗИПКИ">Зипки</option>\                                                                                                                        
                              <option value="СВИТЕРЫ">Свитеры</option>\                                                                                                                    
                              <option value="ШТАНЫ">Штаны</option>\                                                                                                                        
                              <option value="КУРТКИ">Куртки</option>\                                                                                                                      
                              <option value="АКСЕССУАРЫ">Аксессуары</option>\                                                                                                              
                            </select>' /opt/finds-beck/frontend/src/pages/store-dashboard/ui/StoreDashboard.tsx                                                                            
                                                                                                                                                                                           
  echo "Все исправления применены!"                                                                                                                                                        
  SCRIPT                                                                                                                                                                                   
                                                                                                                                                                                           
  chmod +x /tmp/fix_categories.sh
