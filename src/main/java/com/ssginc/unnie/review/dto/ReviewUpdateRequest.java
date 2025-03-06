package com.ssginc.unnie.review.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 리뷰 수정 전용 DTO 클래스
 */
@Getter
@Setter
@SuperBuilder
public class ReviewUpdateRequest extends ReviewRequestBase{

    private LocalDateTime reviewDate; //리뷰 작성 일시 수정
    private MultipartFile file;

    public ReviewUpdateRequest(long reviewId, // 리뷰 번호
                               long reviewMemberId, // 작성자 번호
                               long reviewReceiptId, // 영수증 번호
                               String reviewImage, // 리뷰 대표 이미지
                               int reviewRate, // 리뷰 별점
                               String reviewContent, // 리뷰 내용
                               LocalDateTime reviewDate, // 리뷰 작성 일시 수정
                               List<Integer> keywordIds,
                                MultipartFile file) {// 수정될 키워드 목록
        super(reviewId, reviewMemberId, reviewReceiptId, reviewImage, reviewRate, reviewContent, keywordIds, file);
        this.reviewDate = reviewDate;
        this.file = file;
    }
}
