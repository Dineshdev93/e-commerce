import styled from 'styled-components';

export const RegisterContainer = styled.div`
  display: flex;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  background-color: #f8fafc;
`;

export const LeftSection = styled.div`
  flex: 1.2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background-color: #ffffff;
`;

export const RightSection = styled.div`
//   flex: 1;
  background: linear-gradient(rgba(223, 208, 208, 0.1), rgba(139, 129, 129, 0.4)), 
              url('https://unsplash.com/photos/woman-cooking-on-a-stovetop-in-a-kitchen-eoTvdke70Vw');
  background-size: cover;
  background-position: center;
  
  @media (max-width: 900px) {
    display: none;
  }
`;

export const FormWrapper = styled.form`
  width: 100%;
  max-width: 450px;
`;

export const Title = styled.h1`
  margin-bottom: 8px;
  color: #1e293b;
  font-size: 1.8rem;
`;

export const Subtitle = styled.p`
  margin-bottom: 24px;
  color: #64748b;
  font-size: 0.9rem;
`;

export const ProfilePreviewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
`;

export const AvatarCircle = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #4a90e2;
  margin-bottom: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

export const InputGroup = styled.div`
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
`;

export const Label = styled.label`
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  color: #475569;
`;

export const Input = styled.input`
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  }
`;

export const RegisterButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: #1e293b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.3s;

  &:hover {
    background-color: #0f172a;
  }
`;