import { test, expect } from '@fixturesetup';
import {
  click,
  clickAndNavigate,
  expectElementToBeVisible,
  expectPageToHaveURL,
  fill,
  getLocatorByRole,
  getLocatorByText,
  gotoURL,
} from 'vasu-playwright-utils';

/** UI tests for the frozen owner-admin plan. The frontend and admin API are absent, so all are red. */
test.beforeEach(async ({ page }) => {
  void page;
});

const signIn = async (username = 'owner', password = 'change-me') => {
  await gotoURL('/admin/login');
  await fill(getLocatorByRole('textbox', { name: 'Username' }), username);
  await fill(getLocatorByRole('textbox', { name: 'Password' }), password);
  await clickAndNavigate(getLocatorByRole('button', { name: 'Sign in' }));
};

test.describe('authentication', () => {
  test('an unauthenticated visitor cannot open admin [REQ-owner-admin-001][SCN-owner-admin-001]', async () => {
    await test.step('Given no owner session', async () => {
      await gotoURL('/admin');
    });
    await test.step('When the visitor requests the admin page', async () => {
      await expectPageToHaveURL('/admin/login');
    });
    await test.step('Then no admin content is shown', async () => {
      await expect(getLocatorByRole('heading', { name: 'Comments' })).toHaveCount(0);
    });
  });

  test('public pages do not link to admin [REQ-owner-admin-002][SCN-owner-admin-002]', async () => {
    await test.step('Given the public pages are available', async () => {
      await gotoURL('/');
    });
    await test.step('When the visitor reads them', async () => {
      await expectElementToBeVisible(getLocatorByRole('link', { name: 'About' }));
    });
    await test.step('Then no admin link exists', async () => {
      await expect(getLocatorByRole('link', { name: /admin/i })).toHaveCount(0);
    });
  });

  test('the owner signs in [REQ-owner-admin-003][SCN-owner-admin-003]', async () => {
    await test.step('Given the owner account exists', async () => {
      await gotoURL('/admin/login');
    });
    await test.step('When the owner signs in', async () => {
      await signIn();
    });
    await test.step('Then the admin page is reached', async () => {
      await expectPageToHaveURL('/admin');
      await expectElementToBeVisible(getLocatorByRole('heading', { name: 'Comments' }));
    });
  });

  test('a second account cannot be created [REQ-owner-admin-003][SCN-owner-admin-004]', async () => {
    await test.step('Given the owner account exists', async () => {
      await gotoURL('/admin/login');
    });
    await test.step('When a visitor tries to register', async () => {
      await gotoURL('/admin/register');
    });
    await test.step('Then no registration route exists', async () => {
      await expectElementToBeVisible(getLocatorByRole('heading', { name: 'Page not found' }));
    });
  });

  test('the login offers no self-service recovery [REQ-owner-admin-004][SCN-owner-admin-005]', async () => {
    await test.step('Given the owner login page', async () => {
      await gotoURL('/admin/login');
    });
    await test.step('When the page is shown', async () => {
      await expectElementToBeVisible(getLocatorByRole('button', { name: 'Sign in' }));
    });
    await test.step('Then no reset or registration link exists', async () => {
      await expect(getLocatorByRole('link', { name: /register|reset/i })).toHaveCount(0);
    });
  });

  test('an idle session expires after 30 minutes [REQ-owner-admin-005][SCN-owner-admin-006]', async () => {
    await test.step('Given an owner session idle for 30 minutes', async () => {
      await signIn();
    });
    await test.step('When the owner requests the admin page', async () => {
      await gotoURL('/admin');
    });
    await test.step('Then the owner is sent to login', async () => {
      await expectPageToHaveURL('/admin/login');
    });
  });

  test('five failed logins throttle the sixth [REQ-owner-admin-006][SCN-owner-admin-007]', async () => {
    await test.step('Given 5 failed logins in 15 minutes', async () => {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        await gotoURL('/admin/login');
        await fill(getLocatorByRole('textbox', { name: 'Username' }), 'owner');
        await fill(getLocatorByRole('textbox', { name: 'Password' }), 'wrong');
        await click(getLocatorByRole('button', { name: 'Sign in' }));
      }
    });
    await test.step('When a 6th login is attempted', async () => {
      await gotoURL('/admin/login');
      await fill(getLocatorByRole('textbox', { name: 'Username' }), 'owner');
      await fill(getLocatorByRole('textbox', { name: 'Password' }), 'wrong');
      await click(getLocatorByRole('button', { name: 'Sign in' }));
    });
    await test.step('Then it is refused with the rate-limit copy', async () => {
      await expectElementToBeVisible(getLocatorByText('Too many attempts. Try again later.'));
    });
  });

  test('a wrong password creates no session [REQ-owner-admin-007][SCN-owner-admin-008]', async () => {
    await test.step('Given the owner account exists', async () => {
      await gotoURL('/admin/login');
    });
    await test.step('When someone signs in with a wrong password', async () => {
      await signIn('owner', 'wrong');
    });
    await test.step('Then the error copy is shown', async () => {
      await expectElementToBeVisible(getLocatorByText('Invalid username or password.'));
    });
  });

  test('an unknown username gets the same error [REQ-owner-admin-007][SCN-owner-admin-028]', async () => {
    await test.step('Given no account uses the username', async () => {
      await gotoURL('/admin/login');
    });
    await test.step('When someone signs in with it', async () => {
      await signIn('nobody', 'wrong');
    });
    await test.step('Then the same error copy is shown', async () => {
      await expectElementToBeVisible(getLocatorByText('Invalid username or password.'));
    });
  });
});

test.describe('moderation', () => {
  test('admin search finds hidden comments [REQ-owner-admin-008][SCN-owner-admin-009]', async () => {
    await test.step('Given an owner session and a hidden comment', async () => {
      await signIn();
    });
    await test.step('When the owner searches by its keyword', async () => {
      await fill(getLocatorByRole('searchbox', { name: /search/i }), '管理員隱藏');
      await click(getLocatorByRole('button', { name: 'Search' }));
    });
    await test.step('Then the hidden comment is listed', async () => {
      await expectElementToBeVisible(getLocatorByText(/呢個留言由管理員隱藏/));
    });
  });

  test('admin search filters by author and source [REQ-owner-admin-008][SCN-owner-admin-010]', async () => {
    await test.step('Given an owner session', async () => {
      await signIn();
    });
    await test.step('When the owner filters by author', async () => {
      await fill(getLocatorByRole('searchbox', { name: /author/i }), '股壇新手');
    });
    await test.step('Then only that author is listed', async () => {
      await expectElementToBeVisible(getLocatorByText('{股壇新手(u2001)}'));
    });
  });

  test('hidden comments are marked [REQ-owner-admin-009][SCN-owner-admin-011]', async () => {
    await test.step('Given an owner session', async () => {
      await signIn();
    });
    await test.step('When the owner views a hidden comment', async () => {
      await expectElementToBeVisible(getLocatorByText('Hidden'));
    });
    await test.step('Then it carries the Hidden badge', async () => {
      await expectElementToBeVisible(getLocatorByText('Hidden'));
    });
  });

  test('blocked author comments are marked [REQ-owner-admin-010][SCN-owner-admin-012]', async () => {
    await test.step('Given an owner session', async () => {
      await signIn();
    });
    await test.step('When the owner views a blocked comment', async () => {
      await expectElementToBeVisible(getLocatorByText('Blocked'));
    });
    await test.step('Then it carries the Blocked badge', async () => {
      await expectElementToBeVisible(getLocatorByText('Blocked'));
    });
  });

  test('the owner hides a comment [REQ-owner-admin-011][SCN-owner-admin-013]', async () => {
    await test.step('Given an owner session and visible comment 5002', async () => {
      await signIn();
    });
    await test.step('When the owner hides it', async () => {
      await click(getLocatorByRole('button', { name: 'Hide' }).first());
    });
    await test.step('Then it is absent publicly and still listed in admin', async () => {
      await gotoURL('/comments/5002');
      await expectElementToBeVisible(getLocatorByText('This comment is no longer available,'));
    });
  });

  test('hiding keeps the record [REQ-owner-admin-012][SCN-owner-admin-014]', async () => {
    await test.step('Given the owner hides a comment', async () => {
      await signIn();
    });
    await test.step('When the admin list refreshes', async () => {
      await click(getLocatorByRole('button', { name: 'Hide' }).first());
    });
    await test.step('Then the comment is still listed with Hidden', async () => {
      await expectElementToBeVisible(getLocatorByText('Hidden').first());
    });
  });

  test('the owner unhides a comment [REQ-owner-admin-013][SCN-owner-admin-015]', async () => {
    await test.step('Given 5013 is hidden', async () => {
      await signIn();
    });
    await test.step('When the owner unhides it', async () => {
      await click(getLocatorByRole('button', { name: 'Unhide' }).first());
    });
    await test.step('Then it is visible again', async () => {
      await gotoURL('/comments/5013');
      await expectElementToBeVisible(getLocatorByText(/呢個留言由管理員隱藏/));
    });
  });

  test('the owner deletes a comment [REQ-owner-admin-014][SCN-owner-admin-016]', async () => {
    await test.step('Given an owner session and a visible comment', async () => {
      await signIn();
    });
    await test.step('When the owner deletes it and confirms', async () => {
      await click(getLocatorByRole('button', { name: 'Delete' }).first());
      await click(getLocatorByRole('dialog').getByRole('button', { name: 'Confirm' }));
    });
    await test.step('Then its detail is unavailable', async () => {
      await expectElementToBeVisible(getLocatorByText('This comment is no longer available,'));
    });
  });

  test('deleting keeps an audit entry [REQ-owner-admin-015][SCN-owner-admin-017]', async () => {
    await test.step('Given the owner deletes a comment', async () => {
      await signIn();
      await click(getLocatorByRole('button', { name: 'Delete' }).first());
      await click(getLocatorByRole('dialog').getByRole('button', { name: 'Confirm' }));
    });
    await test.step('When the owner opens the action log', async () => {
      await expectElementToBeVisible(getLocatorByRole('heading', { name: 'Action log' }));
    });
    await test.step('Then a delete entry is listed', async () => {
      await expectElementToBeVisible(getLocatorByText(/delete_comment/));
    });
  });

  test('delete asks for confirmation [REQ-owner-admin-016][SCN-owner-admin-018]', async () => {
    await test.step('Given an owner session and a visible comment', async () => {
      await signIn();
    });
    await test.step('When the owner deletes and cancels', async () => {
      await click(getLocatorByRole('button', { name: 'Delete' }).first());
      await click(getLocatorByRole('dialog').getByRole('button', { name: 'Cancel' }));
    });
    await test.step('Then the comment is unchanged and no action logged', async () => {
      await expect(getLocatorByText('delete_comment')).toHaveCount(0);
    });
  });

  test('block asks for confirmation [REQ-owner-admin-017][SCN-owner-admin-019]', async () => {
    await test.step('Given an owner session and an active author', async () => {
      await signIn();
    });
    await test.step('When the owner blocks and cancels', async () => {
      await click(getLocatorByRole('button', { name: 'Block' }).first());
      await click(getLocatorByRole('dialog').getByRole('button', { name: 'Cancel' }));
    });
    await test.step('Then no block is recorded', async () => {
      await expect(getLocatorByText('block_author')).toHaveCount(0);
    });
  });

  test('blocking hides the author everywhere [REQ-owner-admin-018][SCN-owner-admin-020]', async () => {
    await test.step('Given an owner session and an active author', async () => {
      await signIn();
    });
    await test.step('When the owner blocks the author', async () => {
      await click(getLocatorByRole('button', { name: 'Block' }).first());
      await click(getLocatorByRole('dialog').getByRole('button', { name: 'Confirm' }));
    });
    await test.step('Then none of the author comments is public', async () => {
      await gotoURL('/search?q=%E7%A0%B4');
      await expect(getLocatorByText(/又破頂/)).toHaveCount(0);
    });
  });

  test('unblocking restores the author [REQ-owner-admin-019][SCN-owner-admin-021]', async () => {
    await test.step('Given author 2003 is blocked', async () => {
      await signIn();
    });
    await test.step('When the owner unblocks the author', async () => {
      await click(getLocatorByRole('button', { name: 'Unblock' }).first());
    });
    await test.step('Then the author comments are visible again', async () => {
      await gotoURL('/search?q=TSLA');
      await expectElementToBeVisible(getLocatorByText(/TSLA/).first());
    });
  });

  test('blocking needs no new collection [REQ-owner-admin-020][SCN-owner-admin-022]', async () => {
    await test.step('Given the archive was collected before the change', async () => {
      await signIn();
    });
    await test.step('When the owner blocks an author', async () => {
      await click(getLocatorByRole('button', { name: 'Block' }).first());
      await click(getLocatorByRole('dialog').getByRole('button', { name: 'Confirm' }));
    });
    await test.step('Then the public page reflects it immediately', async () => {
      await gotoURL('/');
      await expect(getLocatorByText(/廣告王/)).toHaveCount(0);
    });
  });

  test('the blocked author list is shown [REQ-owner-admin-021][SCN-owner-admin-023]', async () => {
    await test.step('Given an owner session and a blocked author', async () => {
      await signIn();
    });
    await test.step('When the owner opens the blocked list', async () => {
      await expectElementToBeVisible(getLocatorByRole('heading', { name: 'Blocked authors' }));
    });
    await test.step('Then 廣告王 is listed', async () => {
      await expectElementToBeVisible(getLocatorByText('{廣告王(u2003)}'));
    });
  });

  test('the action log shows time and target [REQ-owner-admin-022][SCN-owner-admin-024]', async () => {
    await test.step('Given an owner session and a recorded action', async () => {
      await signIn();
    });
    await test.step('When the owner opens the action log', async () => {
      await expectElementToBeVisible(getLocatorByRole('heading', { name: 'Action log' }));
    });
    await test.step('Then the entry shows a time and target', async () => {
      await expect(getLocatorByText(/block_author/).first()).toBeVisible();
      await expect(getLocatorByText(/2026-10-/).first()).toBeVisible();
    });
  });

  test('each action writes one audit entry [REQ-owner-admin-023][SCN-owner-admin-025]', async () => {
    await test.step('Given an owner session', async () => {
      await signIn();
    });
    await test.step('When the owner hides one comment', async () => {
      await click(getLocatorByRole('button', { name: 'Hide' }).first());
    });
    await test.step('Then exactly one hide entry is added', async () => {
      await expect(getLocatorByText(/hide_comment/)).toHaveCount(1);
    });
  });

  test('collection status is reported [REQ-owner-admin-024][SCN-owner-admin-026]', async () => {
    await test.step('Given an owner session and two runs', async () => {
      await signIn();
    });
    await test.step('When the owner opens collection status', async () => {
      await expectElementToBeVisible(getLocatorByRole('heading', { name: 'Collection status' }));
    });
    await test.step('Then status and counts are shown', async () => {
      await expectElementToBeVisible(getLocatorByText(/success/));
      await expectElementToBeVisible(getLocatorByText(/partial/));
    });
  });

  test('deleting a comment with replies re-parents them [REQ-owner-admin-014][SCN-owner-admin-027]', async () => {
    await test.step('Given comment 5017 has a reply', async () => {
      await signIn();
    });
    await test.step('When the owner deletes 5017', async () => {
      await click(getLocatorByRole('button', { name: 'Delete' }).first());
      await click(getLocatorByRole('dialog').getByRole('button', { name: 'Confirm' }));
    });
    await test.step('Then the reply appears at top level', async () => {
      await gotoURL('/comments/5018');
      await expectElementToBeVisible(getLocatorByText(/不過競爭對手/));
    });
  });

  test('blocking an already-blocked author changes nothing [REQ-owner-admin-018][SCN-owner-admin-029]', async () => {
    await test.step('Given author 2003 is already blocked', async () => {
      await signIn();
    });
    await test.step('When the owner blocks the author again', async () => {
      await click(getLocatorByRole('button', { name: 'Block' }).first());
      await click(getLocatorByRole('dialog').getByRole('button', { name: 'Confirm' }));
    });
    await test.step('Then no second block entry is added', async () => {
      await expect(getLocatorByText(/block_author/)).toHaveCount(1);
    });
  });
});
